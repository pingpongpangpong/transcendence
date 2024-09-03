from django.shortcuts import render
from django.core import serializers
from django.http import JsonResponse, HttpResponse
from .serializers import UserSerializer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# Create your views here.
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserSerializer

class UserLoginView(generics.GenericAPIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        refresh = RefreshToken.for_user(user)
        response = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def LoginCheckView(request):
    return Response({'message': 'This is a protected view.'})
    