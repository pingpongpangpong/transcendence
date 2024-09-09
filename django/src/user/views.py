from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from .serializers import UserSignupSerializer, UserLoginSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

# Create your views here.
class UserRegistrationView(generics.CreateAPIView):
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

class UserLoginView(TokenObtainPairView):
    serializer_class = UserLoginSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def LoginCheckView(request):
    return Response({'message': 'This is a protected view.'})
