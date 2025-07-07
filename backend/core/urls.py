from django.urls import path
from .views import RegisterView, CustomTokenObtainPairView, P9UploadView, GenerateZipView, UserListView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import AgentClientListView
from .views import UserDeleteView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('upload-p9/', P9UploadView.as_view(), name='upload-p9'),
    path('generate-zip/', GenerateZipView.as_view(), name='generate-zip'),
    path('agent/clients/', AgentClientListView.as_view(), name='agent-clients'),
    path('api/users/', UserListView.as_view()),
    path("users/<int:id>/", UserDeleteView.as_view()),

]
