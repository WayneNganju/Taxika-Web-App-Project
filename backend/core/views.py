import csv, io, zipfile, datetime
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.files.base import ContentFile
from .permissions import IsTaxpayer, IsAgent
from .models import User, P9Form, TaxRecord, TaxZip, ClientProfile
from .serializers import (
    RegisterSerializer,
    P9UploadSerializer,
    TaxRecordSerializer,
    TaxZipSerializer,
    ClientProfileSerializer,
    UserSerializer
)
from rest_framework.permissions import IsAdminUser
from rest_framework.generics import ListAPIView, DestroyAPIView

# ✅ Admin-Restricted Agent/Admin Registration
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def get_permissions(self):
        if self.request.method == "POST" and self.request.data.get("role") in ["agent", "admin"]:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

# 🔐 JWT Login with Role
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# 📤 Upload P9 CSV + PAYE Computation (2025 Rates)
class P9UploadView(APIView):
    permission_classes = [IsTaxpayer]
    parser_classes = [MultiPartParser]

    def post(self, request):
        serializer = P9UploadSerializer(data=request.data)
        if serializer.is_valid():
            p9 = serializer.save(user=request.user)
            file = request.FILES['file']
            decoded = file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded)

            total_income = 0
            for row in reader:
                try:
                    salary = float(row.get("Basic Salary", 0))
                    benefits = float(row.get("Benefits", 0))
                    total_income += salary + benefits
                except:
                    continue

            # 🇰🇪 Kenya PAYE (2025) + Reliefs + Deductions
            def compute_paye(income):
                bands = [
                    (24000, 0.10),
                    (32333, 0.25),
                    (500000, 0.30),
                    (800000, 0.325),
                    (float('inf'), 0.35),
                ]
                tax = 0
                prev = 0
                for limit, rate in bands:
                    if income > limit:
                        tax += (limit - prev) * rate
                        prev = limit
                    else:
                        tax += (income - prev) * rate
                        break

                # Apply statutory deductions
                shif = max(300, round(income * 0.0275, 2))
                nssf = 1080
                housing_levy = round(income * 0.015, 2)
                personal_relief = 2400

                net_tax = tax - personal_relief
                net_tax = max(0, net_tax)  # No negative tax
                return round(net_tax, 2)

            paye = compute_paye(total_income)

            tax_record = TaxRecord.objects.create(
                user=request.user,
                year="2025",
                gross_income=total_income,
                taxable_income=total_income,
                computed_paye=paye
            )

            return Response({
                "p9": P9UploadSerializer(p9).data,
                "tax_record": TaxRecordSerializer(tax_record).data
            })
        return Response(serializer.errors, status=400)

# 📦 Generate ZIP for Taxpayer
class GenerateZipView(APIView):
    permission_classes = [IsTaxpayer]

    def get(self, request):
        user = request.user
        tax_records = TaxRecord.objects.filter(user=user)
        if not tax_records.exists():
            return Response({"error": "No tax records found."}, status=404)

        lines = ["Tax Year,Gross Income,Taxable Income,Computed PAYE"]
        for record in tax_records:
            lines.append(f"{record.year},{record.gross_income},{record.taxable_income},{record.computed_paye}")
        csv_content = "\n".join(lines)

        mem_zip = io.BytesIO()
        with zipfile.ZipFile(mem_zip, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("tax_summary.csv", csv_content)
        mem_zip.seek(0)

        file_name = f"taxika_{user.username}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        django_file = ContentFile(mem_zip.read(), name=file_name)
        tax_zip = TaxZip.objects.create(user=user, zip_file=django_file)

        return Response({
            "message": "ZIP generated",
            "download_url": request.build_absolute_uri(tax_zip.zip_file.url)
        })

# 🧑‍💼 Agent: View Clients (Filtered)
class AgentClientListView(APIView):
    permission_classes = [IsAgent]

    def get(self, request):
        agent = request.user
        year = request.query_params.get("year")
        status = request.query_params.get("status")

        clients = ClientProfile.objects.filter(agent=agent)
        filtered_data = []

        for client in clients:
            tax_records = client.taxpayer.taxrecord_set.all()
            if year:
                tax_records = tax_records.filter(year=year)
            if status == "filed":
                tax_records = tax_records.exclude(computed_paye__isnull=True)
            elif status == "unfiled":
                tax_records = tax_records.filter(computed_paye__isnull=True)

            filtered_data.append({
                "taxpayer_name": client.taxpayer.username,
                "taxpayer_email": client.taxpayer.email,
                "tax_records": TaxRecordSerializer(tax_records, many=True).data
            })

        return Response(filtered_data)

# 📦 Agent: Generate ZIP for a client
class GenerateClientZipView(APIView):
    permission_classes = [IsAgent]

    def get(self, request, user_id):
        try:
            client = User.objects.get(id=user_id, role="taxpayer")
        except User.DoesNotExist:
            return Response({"error": "Client not found or not a taxpayer."}, status=404)

        if not ClientProfile.objects.filter(agent=request.user, taxpayer=client).exists():
            return Response({"error": "You are not assigned to this client."}, status=403)

        tax_records = TaxRecord.objects.filter(user=client)
        if not tax_records.exists():
            return Response({"error": "No tax records found for this client."}, status=404)

        lines = ["Tax Year,Gross Income,Taxable Income,Computed PAYE"]
        for record in tax_records:
            lines.append(f"{record.year},{record.gross_income},{record.taxable_income},{record.computed_paye}")

        mem_zip = io.BytesIO()
        with zipfile.ZipFile(mem_zip, "w", zipfile.ZIP_DEFLATED) as zf:
            filename = f"{client.username}_summary_{datetime.datetime.now().strftime('%Y%m%d')}.csv"
            zf.writestr(filename, "\n".join(lines))

        mem_zip.seek(0)
        file_name = f"{client.username}_tax_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        django_file = ContentFile(mem_zip.read(), name=file_name)
        TaxZip.objects.create(user=client, zip_file=django_file)

        return Response({
            "message": "Client ZIP generated",
            "download_url": request.build_absolute_uri(django_file.name)
        })

# 👥 Admin-only User Management
class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class UserDeleteView(DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "id"
