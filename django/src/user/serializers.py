import re
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
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    #password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    # Username 유효성 검사
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        if not (5 <= len(value) <= 20):
            raise serializers.ValidationError("Username must be between 5 and 20 characters.")
        return value

    # Password 유효성 검사
    def validate_password(self, value):
        if not (8 <= len(value) <= 20):
            raise serializers.ValidationError("Password must be between 8 and 20 characters.")

        # 특수문자, 숫자, 영어 대소문자 각각 1글자 이상 포함해야 함
        if not re.search(r"[a-z]", value):
            raise ValidationError("비밀번호는 하나 이상의 소문자가 포함되어야 합니다.")
        if not re.search(r"[A-Z]", value):
            raise ValidationError("비밀번호는 하나 이상의 대문자가 포함되어야 합니다.")
        if not re.search(r"\d", value):
            raise ValidationError("비밀번호는 하나 이상의 숫자가 포함되어야 합니다.")
        if not re.search(r"[\W_]", value):
            raise ValidationError("비밀번호는 하나 이상의 특수문자가 포함되어야 합니다.")

        return value

    # Email 유효성 검사 (DRF의 기본 이메일 유효성 검사기를 사용)
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user