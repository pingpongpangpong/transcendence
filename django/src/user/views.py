import random
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from django.core.mail import send_mail
from .serializers import UserSignupSerializer, UserLoginSerializer, UserSendEmail, UserTokenRefreshSerializer
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class UserSendEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserSendEmail(data=request.data)

        email = request.data.get('email')
        # 랜덤 6자리 숫자 생성
        verification_code = random.randint(100000, 999999)

        # 이메일 발송
        send_mail(
            subject='PingPongPangPong Email Verification Code',
            message=f'Your verification code is {verification_code}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({"message": "Email sent successfully."}, status=status.HTTP_200_OK)

        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserRegistrationView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSignupSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({"result": "ok"}, status=status.HTTP_201_CREATED)
        else:
            # 첫번째 에러만 반환하는 로직
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
                return response
            except Exception as e:
                return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"refresh": "This Cookie is required"}, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer

    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get('refresh', None) and response.data.get('access', None):
            cookie_max_age = 60 * 60 * 24
            response.set_cookie('refresh', response.data['refresh'], max_age=cookie_max_age, httponly=True, secure=True)
            cookie_max_age = 60 * 30
            response.set_cookie('access', response.data['access'], max_age=cookie_max_age, httponly=True, secure=True)
            del response.data['access']
            del response.data['refresh']
            response.data = {"detail": "Login successful"}
        return super().finalize_response(request, response, *args, **kwargs)

class UserRefreshView(TokenRefreshView):
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
            cookie_max_age = 60 * 60 * 24
            response.set_cookie('refresh', response.data['refresh'], max_age=cookie_max_age, httponly=True, secure=True)
            cookie_max_age = 60 * 30
            response.set_cookie('access', response.data['access'], max_age=cookie_max_age, httponly=True, secure=True)
            del response.data['access']
            del response.data['refresh']
            response.data = {"detail": "Refresh successful"}
        return super().finalize_response(request, response, *args, **kwargs)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def LoginCheckView(request):
    return Response({'detail': 'This is a protected view.'})