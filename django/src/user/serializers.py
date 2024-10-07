import re
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import EmailVerification

# Email 발송
class UserSendEmail(serializers.Serializer):  # ModelSerializer 대신 Serializer 사용
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("이미 존재하는 Email입니다.")
        return value

class UserTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = None
    def validate(self, attrs):
        attrs['refresh'] = self.context['request'].COOKIES.get('refresh')
        if attrs['refresh']:
            return super().validate(attrs)
        else:
            raise InvalidToken('No valid token found in cookie \'refresh\'')

# 회원가입
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
            raise serializers.ValidationError("ID가 이미 존재합니다.")
        if not (5 <= len(value) <= 20):
            raise serializers.ValidationError("ID는 최소 5글자부터 20글자까지 가능합니다.")
        if ' ' in value:
            raise serializers.ValidationError("ID에는 공백을 포함할 수 없습니다.")
        return value

    # Password 유효성 검사
    def validate_password(self, value):
        if not (8 <= len(value) <= 20):
            raise serializers.ValidationError("비밀번호는 8글자부터 20글자까지 가능합니다.")

        # 특수문자, 숫자, 영어 대소문자 각각 1글자 이상 포함해야 함
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("비밀번호는 하나 이상의 소문자가 포함되어야 합니다.")
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("비밀번호는 하나 이상의 대문자가 포함되어야 합니다.")
        if not re.search(r"\d", value):
            raise serializers.ValidationError("비밀번호는 하나 이상의 숫자가 포함되어야 합니다.")
        if not re.search(r"[\W_]", value):
            raise serializers.ValidationError("비밀번호는 하나 이상의 특수문자가 포함되어야 합니다.")

        return value

    # Email 유효성 검사 (DRF의 기본 이메일 유효성 검사기를 사용)
    def validate_email(self, value):
        if ' ' in value:
            raise serializers.ValidationError("Email에는 공백을 포함할 수 없습니다.")
        try:
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError("이미 가입된 이메일입니다.")
            email_verification = EmailVerification.objects.get(email=value)
            if not email_verification.is_verified:
                raise serializers.ValidationError("이메일이 아직 인증되지 않았습니다.")
        except EmailVerification.DoesNotExist:
            raise serializers.ValidationError("이메일에 대한 인증 정보가 없습니다.")
        return value

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()

        email_verification = EmailVerification.objects.get(email=validated_data['email'])
        email_verification.delete()
        return user