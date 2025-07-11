from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    P9UploadView,
    GenerateZipView,
    AgentClientListView,
    GenerateClientZipView,
    UserListView,
    UserDeleteView,
)

urlpatterns = [
    # 🔐 Auth
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 👤 Taxpayer
    path("upload-p9/", P9UploadView.as_view(), name="upload-p9"),
    path("generate-zip/", GenerateZipView.as_view(), name="generate-zip"),

    # 🧑‍💼 Agent
    path("agent/clients/", AgentClientListView.as_view(), name="agent-clients"),
    path("agent/clients/<int:user_id>/zip/", GenerateClientZipView.as_view(), name="agent-client-zip"),

    # 🛠️ Admin
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<int:id>/", UserDeleteView.as_view(), name="user-delete"),
]
