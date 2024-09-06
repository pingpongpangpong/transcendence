from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserLoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

class UserSignupSerializer(serializers.ModelSerializer):
    #username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    #password2 = serializers.CharField(write_only=True, required=True)
    #email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user