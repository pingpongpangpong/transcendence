from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from .serializers import UserSignupSerializer, UserLoginSerializer
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

# Create your views here.
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserSignupSerializer

class UserLoginView(TokenObtainPairView):
    serializer_class = UserLoginSerializer

class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"detail": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
            except Exception as e:
                return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"detail": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def LoginCheckView(request):
    return Response({'message': 'This is a protected view.'}, status=status.HTTP_200_OK)
    