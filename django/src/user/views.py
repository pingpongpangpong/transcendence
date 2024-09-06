from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from .serializers import UserSignupSerializer, UserLoginSerializer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

# Create your views here.
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserSignupSerializer

class UserLoginView(TokenObtainPairView):
    serializer_class = UserLoginSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def LoginCheckView(request):
    return Response({'message': 'This is a protected view.'})
    