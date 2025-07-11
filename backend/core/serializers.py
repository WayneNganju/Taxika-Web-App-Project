from rest_framework import serializers
from .models import User, P9Form, TaxRecord, TaxZip, ClientProfile
from django.contrib.auth.password_validation import validate_password


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        return User.objects.create_user(**validated_data)


class P9UploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = P9Form
        fields = ['file']


class TaxRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRecord
        fields = '__all__'


class TaxZipSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxZip
        fields = '__all__'


class ClientTaxRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRecord
        fields = ['year', 'gross_income', 'taxable_income', 'computed_paye', 'created_at']


class ClientProfileSerializer(serializers.ModelSerializer):
    taxpayer_name = serializers.CharField(source='taxpayer.username', read_only=True)
    taxpayer_email = serializers.EmailField(source='taxpayer.email', read_only=True)
    tax_records = serializers.SerializerMethodField()

    class Meta:
        model = ClientProfile
        fields = ['id', 'taxpayer_name', 'taxpayer_email', 'tax_records', 'created_at']

    def get_tax_records(self, obj):
        records = TaxRecord.objects.filter(user=obj.taxpayer)
        return ClientTaxRecordSerializer(records, many=True).data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
