import os
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

# 🔐 Custom user model with role-based access
class User(AbstractUser):
    ROLE_CHOICES = (
        ('taxpayer', 'Taxpayer'),
        ('agent', 'Tax Agent'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='taxpayer')

    def __str__(self):
        return f"{self.username} ({self.role})"


# 📤 Uploaded P9 form
class P9Form(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='p9_uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"P9 uploaded by {self.user.username} on {self.uploaded_at}"


# 🧮 Computed tax results from P9
class TaxRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    year = models.CharField(max_length=10)
    gross_income = models.DecimalField(max_digits=12, decimal_places=2)
    taxable_income = models.DecimalField(max_digits=12, decimal_places=2)
    computed_paye = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Tax Year {self.year}"


# 📦 ZIP file export path
def zip_upload_path(instance, filename):
    return os.path.join("zip_exports", f"user_{instance.user.id}", filename)


# 📦 ZIP export record for taxpayer or agent
class TaxZip(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    zip_file = models.FileField(upload_to=zip_upload_path)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ZIP by {self.user.username} on {self.created_at.strftime('%Y-%m-%d')}"


# 👥 Agent-Taxpayer Assignment
class ClientProfile(models.Model):
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='clients'
    )
    taxpayer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='assigned_agent'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.agent.username} manages {self.taxpayer.username}"
