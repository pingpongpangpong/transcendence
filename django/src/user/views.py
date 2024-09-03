from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .forms import UserSignupForm
import json

def signup(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			form = UserSignupForm(data)
			if form.is_valid():
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