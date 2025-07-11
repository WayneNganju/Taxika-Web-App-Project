from django.contrib import admin
from .models import User, P9Form, TaxRecord, TaxZip, ClientProfile
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# 🔐 Custom User Admin to show roles
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Role Info", {"fields": ("role",)}),
    )
    list_display = ("username", "email", "role", "is_staff", "is_superuser")
    list_filter = ("role", "is_staff", "is_superuser")

admin.site.register(User, UserAdmin)
admin.site.register(P9Form)
admin.site.register(TaxRecord)
admin.site.register(TaxZip)
admin.site.register(ClientProfile)
