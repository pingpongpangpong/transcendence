from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', views.UserLoginView.as_view(), name='obtain_pair_token'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    path('signup/', views.UserRegistrationView.as_view()),
    path('check/', views.LoginCheckView, name='login_check'),
]