from django.urls import path
from . import views

urlpatterns = [
    path('pre-login/', views.UserPreLoginView.as_view(), name='pre-login'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('oauth/', views.UserOauthView.as_view(), name='oauth'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('refresh/', views.UserRefreshView.as_view(), name='refresh'),
    path('signup/', views.UserRegistrationView.as_view(), name='signup'),
    path('email/', views.UserSendEmailView.as_view(), name='email'),
    path('email-check/', views.UserCheckEmailView.as_view(), name='email-check'),
    path('check/', views.LoginCheckView, name='check'),
    path('session/', views.LoginSessionCheckView, name='session'),
]