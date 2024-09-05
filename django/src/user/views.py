from django.http import JsonResponse
from django.contrib.auth import get_user_model
import json
from .forms import UserSignupForm

User = get_user_model()
def signup(request):
	print(f"request Data : {request}\n")
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			print(f"Parse Data : {data}")
			form = UserSignupForm(data)
			if form.is_valid():
				username = form.cleaned_data.get('userId')
				password = form.cleaned_data.get('password')
				email = form.cleaned_data.get('email')
				User.objects.create_user(username=username, password=password, email=email)
				return JsonResponse({'result': 'ok'}, status=200)
			else:
				first_error = next(iter(form.errors.values()))[0]
				return JsonResponse({'errors': first_error}, status=400)
		except json.JSONDecodeError:
			return JsonResponse({'error': 'Invalid JSON data'}, status=400)
	return JsonResponse({'error': 'Invalid request method'}, status=405)

# Todo
# email authentication
# 코드 받기 -> 코드 확인 -> 회원가입
# 프론트는 전달만하고, 코드 생성은 백엔드에서 처리
# db erd대로 
# 저장이  되는 코드