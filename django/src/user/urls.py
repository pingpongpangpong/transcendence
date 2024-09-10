from django.urls import path, include
from . import views

urlpatterns = [
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('refresh/', views.UserRefreshView.as_view(), name='refresh'),
    path('signup/', views.UserRegistrationView.as_view(), name='signup'),
	path('email/', views.UserSendEmailView.as_view(), name='email'),
    path('check/', views.LoginCheckView, name='login_check'),
]