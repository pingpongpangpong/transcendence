import json
import redis
import requests
from django.http import JsonResponse, HttpResponse
# from .models import Room
from .room import save_room_to_redis, get_roomlist_from_redis

r = redis

def createRoom(request):
    if request.method == 'POST':
        try:
            data_json = json.loads(request.body)
            roomname = data_json.get('roomname')
            password = data_json.get('password')
            goal_point = int(data_json.get('goal_point'))
            player1 = request.user
            save_room_to_redis(roomname, password, goal_point, player1)
            return JsonResponse({'result': 'success',
                                'roomname': data_json['roomname']})
        except KeyError:
            return HttpResponse("key error", status=404)

def listRoom(request):
    if request.method == 'GET':
        try:
            room_list = get_roomlist_from_redis()
            return JsonResponse({"roomlist": room_list})
        except KeyError:
            return HttpResponse("key error", status=400)

# def joinRoom(request):
#     if request.method == 'POST':
#         try:
#             data_json = json.loads(request.body)
#             if Room.objects.filter(room_name=data_json['roomName']).exists():
#                 room = Room.objects.get(room_name=data_json['roomName'])
#                 if (room.password == data_json['password']):
#                     room.player2 = data_json['player2']
#                     room.status = 'running'
#                     room.save()
#                     return JsonResponse({'status': 'success',
#                                          'roomName': room.room_name,
#                                          'player1': room.player1,
#                                          "gamePoint": room.goal_point})
#                 else:
#                     return JsonResponse({'status': 'fail',
#                                          'msg': 'Wrong password'})
#             else:
#                 return HttpResponse("The Room doens't exist", status=400)
#         except KeyError:
#             return HttpResponse("key error", status=400)
        
# def searchRoom(request):
#     if request.method == 'POST':
#         try:
#             data_json = json.loads(request.body)
#             roomList_json = []
#             roomList = Room.objects.filter(room_name=data_json['roomName'], status='ready')
#             for room in roomList:
#                 roomList_json.append({'name': room.room_name,
#                                       'password': room.password != ""})
#             return JsonResponse({'total_page': 1,
#                                  'cur_page': 1,
#                                  'roomList': roomList_json})
#         except KeyError:
#             return HttpResponse("key error", status=400)

# def finishRoom(request):
#     if request.method == 'POST':
#         try:
#             data_json = json.loads(request.body)
#             if Room.objects.filter(room_name=data_json['roomName']).exists():
#                 Room.objects.get(room_name=data_json['roomName']).delete()
#                 return JsonResponse({'result': 'success'})
#             else:
#                 return JsonResponse({'result': 'fail'})
#         except KeyError:
#             return HttpResponse("key error", status=400)

# def exitPlayer(request):
#     if request.method == 'POST':
#         try:
#             data_json = json.loads(request.body)
#             roomList = Room.objects.filter(player1=data_json['player'])
#             for room in roomList:
#                 room.delete()
#         except KeyError:
#             return HttpResponse("key error", status=400)


def login42(request):
    ID = 'u-s4t2ud-42f1f96a76a01483ed55c4244c83f386ea1012c9c77424b41fcc69f232a8aec3'
    SECRET = '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'
    code = request.GET.get("code")

	# token 받아오기
    data = {'grant_type': "authorization_code",
            'client_id': ID,
            'client_secret': SECRET,
            'code': code,
            'scope': 'public'}
    headers = {'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            'X-Mobile': 'false'}
    token_response = requests.post('https://api.intra.42.fr/oauth/token', data = data, headers = headers)
    access_token = token_response.json().get('access_token')

	# token 검증하기
    headers = {"Authorization": f'Bearer {access_token}'}
    token_validate_response = requests.get('https://api.intra.42.fr/oauth/token/info', headers = headers)
    print(token_validate_response.json())

	# 사용자 정보 받아오기
    headers = {"Authorization": f'Bearer {access_token}', 'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'}
    user_info_response = requests.post('https://api.intra.42.fr/v2/me', headers = headers)
    print(user_info_response.json())

    return JsonResponse(user_info_response.json())