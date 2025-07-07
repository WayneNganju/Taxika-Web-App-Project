import csv, io, zipfile, datetime
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.files.base import ContentFile
from .permissions import IsTaxpayer
from .models import User, P9Form, TaxRecord, TaxZip
from .models import ClientProfile
from .serializers import ClientProfileSerializer
from .permissions import IsAgent
from rest_framework.permissions import IsAdminUser
from rest_framework.generics import ListAPIView
from .serializers import UserSerializer
from rest_framework.generics import DestroyAPIView


from .serializers import (
    RegisterSerializer,
    P9UploadSerializer,
    TaxRecordSerializer,
    TaxZipSerializer
)

# 🔐 User Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

# 🔐 Custom JWT Login with Role Included
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# 📤 P9 Upload + PAYE Computation
class P9UploadView(APIView):
    permission_classes = [IsTaxpayer]
    parser_classes = [MultiPartParser]

    def post(self, request):
        serializer = P9UploadSerializer(data=request.data)
        if serializer.is_valid():
            p9 = serializer.save(user=request.user)

            # Extract and parse CSV
            file = request.FILES['file']
            decoded = file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded)

            total_income = 0
            for row in reader:
                try:
                    salary = float(row.get("Basic Salary", 0))
                    benefits = float(row.get("Benefits", 0))
                    gross = salary + benefits
                    total_income += gross
                except:
                    continue

            # Compute PAYE (simplified Kenya tax bands)
            def compute_paye(income):
                if income <= 24000:
                    return income * 0.1
                elif income <= 32333:
                    return (24000 * 0.1) + ((income - 24000) * 0.25)
                else:
                    return (24000 * 0.1) + (8333 * 0.25) + ((income - 32333) * 0.3)

            paye = compute_paye(total_income)

            # Save calculated record
            tax_record = TaxRecord.objects.create(
                user=request.user,
                year="2024",
                gross_income=total_income,
                taxable_income=total_income,
                computed_paye=paye
            )

            return Response({
                "p9": P9UploadSerializer(p9).data,
                "tax_record": TaxRecordSerializer(tax_record).data
            })

        return Response(serializer.errors, status=400)

# 📦 Generate ZIP with tax summary
class GenerateZipView(APIView):
    permission_classes = [IsTaxpayer]

    def get(self, request):
        user = request.user
        tax_records = TaxRecord.objects.filter(user=user)

        if not tax_records.exists():
            return Response({"error": "No tax records found for user."}, status=404)

        # Prepare CSV string
        lines = ["Tax Year,Gross Income,Taxable Income,Computed PAYE"]
        for record in tax_records:
            lines.append(f"{record.year},{record.gross_income},{record.taxable_income},{record.computed_paye}")

        tax_summary_csv = "\n".join(lines)

        # Create ZIP in memory
        mem_zip = io.BytesIO()
        with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
            filename = f"Taxika_P9_Summary_{datetime.datetime.now().strftime('%Y%m%d')}.csv"
            zf.writestr(filename, tax_summary_csv)

        mem_zip.seek(0)

        # Save ZIP to media folder
        file_name = f"taxika_export_{user.username}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        django_file = ContentFile(mem_zip.read(), name=file_name)

        tax_zip = TaxZip.objects.create(user=user, zip_file=django_file)

        return Response({
            "message": "ZIP file generated successfully",
            "download_url": request.build_absolute_uri(tax_zip.zip_file.url)
        })
class AgentClientListView(APIView):
    permission_classes = [IsAgent]

    def get(self, request):
        agent = request.user
        clients = ClientProfile.objects.filter(agent=agent)
        serializer = ClientProfileSerializer(clients, many=True)
        return Response(serializer.data)
class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
class UserDeleteView(DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]
    lookup_field = "id"   