import random, requests, threading
from django.utils.crypto import get_random_string
from .models import LoginSession, EmailVerification, OauthToken
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, update_last_login
from django.contrib.sessions.models import Session
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from .serializers import UserSignupSerializer, UserSendEmail, UserTokenRefreshSerializer
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.settings import api_settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_html(code, to_email):
    subject = 'PingPongPangPong Email Verification Code'
    text_content = f'Your verification code is [{code}]'
    html_content = f'<p>Your verification code is [<strong>{code}</strong>]</p>'
    email = EmailMultiAlternatives(subject,
                                   text_content,
                                   settings.DEFAULT_FROM_EMAIL,
                                   [to_email])
    email.attach_alternative(html_content, "text/html")
    email.send()

def send_email(email):
    try:
        deleted_count = EmailVerification.delete_expired()
        email_verification = EmailVerification.objects.get(email=email)
        return Response({"error": "already sent the code."}, status=status.HTTP_400_BAD_REQUEST)
    except EmailVerification.DoesNotExist:
        pass

    verification_code = get_random_string(12)
    email_verification = EmailVerification.objects.create(email=email, code=verification_code)
    email_verification.save()

    thread = threading.Thread(target=send_html, args=(verification_code, email))
    thread.start()

    return Response({"message": "Email sent successfully."}, status=status.HTTP_200_OK)
    
def check_email(email, verification_code):
    if not email or not verification_code:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    try:
        email_verification = EmailVerification.objects.get(email=email, code=verification_code)
        if email_verification.is_expired == True:
            return Response({"error": "email code is expired"}, status=status.HTTP_400_BAD_REQUEST)
        email_verification.is_verified = True
        email_verification.save()
        return Response(status=status.HTTP_200_OK)
    except EmailVerification.DoesNotExist:
        return Response({"error": "Invalid email or verification code."}, status=status.HTTP_400_BAD_REQUEST)

def user_login_session(request, user):
    if Session.objects.filter(pk=request.session.session_key).exists():
        session = Session.objects.get(pk = request.session.session_key)
        if LoginSession.objects.filter(session=session).exists():
            logout(request)

    if user is not None:
        login(request, user)
        session = Session.objects.get(pk = request.session.session_key)
        if not LoginSession.objects.filter(session=session).exists():
            old_sessions = LoginSession.objects.filter(user=user)
            for old_session in old_sessions:
                old_session.session.delete()
            login_session = LoginSession.objects.create(user=user, session=session)
            login_session.save()

class UserCheckEmailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = ([])
    def post(self, request):
        email = request.data.get('email')
        verification_code = request.data.get('code')
        return check_email(email, verification_code)

class UserSendEmailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = ([])
    serializer_class = UserSendEmail
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        return send_email(email)
    
class UserRegistrationView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = ([])
    serializer_class = UserSignupSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({"result": "ok"}, status=status.HTTP_201_CREATED)
        else:
            first_error_key = next(iter(serializer.errors))
            first_error_message = serializer.errors[first_error_key][0]
            return Response({first_error_key: first_error_message}, status=status.HTTP_400_BAD_REQUEST)

class UserLogoutView(APIView):
    def get(self, request):
        refresh_token = request.COOKIES.get('refresh') or None
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                response = Response({"detail": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
                response.delete_cookie('access')
                response.delete_cookie('refresh')

                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f'usergroup_{request.user.id}',
                    {
                        'type': 'logout'
                    }
                )

                logout(request)
                return response
            except Exception as e:
                return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"refresh": "This Cookie is required"}, status=status.HTTP_400_BAD_REQUEST)

class UserPreLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = ([])

    def post(self, request):
        if request.user:
            logout(request)
        user = authenticate(username=request.data.get('username'), password=request.data.get('password'))
        login(request, user)
        session = Session.objects.get(pk = request.session.session_key)
        if not LoginSession.objects.filter(session=session).exists():
            login_session = LoginSession.objects.create(user=user, session=session)
            login_session.save()
        return send_email(user.email)

class UserLoginView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        verification_code = request.data.get('code')
        try:
            if user and verification_code:
                response = check_email(user.email, verification_code)
                if response.status_code == 200:
                    check = EmailVerification.objects.get(code=verification_code)
                    check.delete()
                    refresh = RefreshToken.for_user(user)
                    response.set_cookie('refresh', str(refresh),max_age=settings.SIMPLE_JWT['REFRESH_COOKIE_AGE'], httponly=True, secure=True)
                    response.set_cookie('access', str(refresh.access_token),max_age=settings.SIMPLE_JWT['ACCESS_COOKIE_AGE'], httponly=True, secure=True)

                    if api_settings.UPDATE_LAST_LOGIN:
                        update_last_login(None, user)
                    user_login_session(request, user)

                    return response
        except:
            return Response({"detail": "sessione or code is not correct."},status=status.HTTP_400_BAD_REQUEST)
    
class UserOauthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = ([])

    def get_access_token(self, code):
        data = {
                "grant_type": "authorization_code",
                "code": code,
                "client_id": settings.OAUTH_42['UID'],
                "client_secret": settings.OAUTH_42['SECRET'],
                "redirect_uri": settings.OAUTH_42['REDIRECT_URI'],
                "scope": "public",
        }
        headers = {'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'}
            
        token_response = requests.post(settings.OAUTH_42['TOKEN_URI'],
                                    data=data,
                                    headers=headers)
        if token_response.status_code != 200:
            raise Exception("Failed to get access token from oauth server")
        
        return token_response.json().get('access_token')
        
    def get_user_data(self, token):
        headers = {"Authorization": f"Bearer {token}",
                    "Content-type": "application/x-www-form-urlencoded;charset=utf-8"}
        user_info_response = requests.get(settings.OAUTH_42['PROFILE_URI'],
                                    headers=headers)
        return user_info_response.json()

    def create_or_get(self, token, user):
        username = user.get('login')
        try:
            oauth = OauthToken.objects.get(username=user.get('login'))
            oauth.access_token = token
            oauth.save()
            return oauth.user
        except OauthToken.DoesNotExist:
            while User.objects.filter(username=username).exists():
                namelength = random.randint(5, 20)
                username = get_random_string(namelength)
            auser = User.objects.create(username=username,
                                        email=user.get('email'),
                                        first_name="oauth")
            password = get_random_string(20)
            auser.set_password(password)
            auser.save()
            oauth = OauthToken.objects.create(username=user.get('login'),
                                              access_token=token,
                                              user=auser)
            oauth.save()
            return oauth.user
        
    def session_login(self, request, user):
        response = Response(status=status.HTTP_301_MOVED_PERMANENTLY)
        response['location'] = "/?Oauth=Success"
        login(request, user)
        session = Session.objects.get(pk = request.session.session_key)
        if not LoginSession.objects.filter(session=session).exists():
            login_session = LoginSession.objects.create(user=user, session=session)
            login_session.save()
        send_email(user.email)
        return response

    def get(self, request):
        code = request.query_params.get("code") or None
        if code is None:
            return Response({"detail": "Failed to get code"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if request.user:
                logout(request)
            access_token = self.get_access_token(code)
            user_info = self.get_user_data(access_token)
            user = self.create_or_get(access_token, user_info)
            response = self.session_login(request, user)
            return response
        except Exception as e:
            return Response({"detail": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)
                          
class UserRefreshView(TokenRefreshView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserTokenRefreshSerializer

    def get(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)

    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get('refresh', None) and response.data.get('access', None):
            response.set_cookie('refresh', response.data['refresh'], max_age=settings.SIMPLE_JWT['REFRESH_COOKIE_AGE'], httponly=True, secure=True)
            response.set_cookie('access', response.data['access'], max_age=settings.SIMPLE_JWT['ACCESS_COOKIE_AGE'], httponly=True, secure=True)
            del response.data['access']
            del response.data['refresh']
            response.data = {"detail": "Refresh successful"}
        return super().finalize_response(request, response, *args, **kwargs)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def LoginCheckView(request):
    return Response({'detail': 'This is a protected view.'})

@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def LoginSessionCheckView(request):
    return Response({'detail': 'This is a protected view.'})
