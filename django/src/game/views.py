import json
import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt # 지워야함
from .room import save_room, get_roomlist, join_room, search_room, delete_room

@csrf_exempt # 지워야함
def createRoom(request):
    if request.method == 'POST':
        try:
            # 이미 만들었는지 탐색?

            data_json = json.loads(request.body)
            roomname = data_json.get('roomname')
            password = data_json.get('password')
            goal_point = int(data_json.get('goalpoint', 10))
            player1 = request.user.username
            save_room(roomname, password, goal_point, player1)
            return HttpResponse("Create", status=200)
        except KeyError:
            return HttpResponse("key error", status=404)

@csrf_exempt # 지워야함
def listRoom(request):
    if request.method == 'GET':
        try:
            room_list = get_roomlist()
            return JsonResponse({"roomlist": room_list})
        except KeyError:
            return HttpResponse("key error", status=400)

@csrf_exempt # 지워야함
def joinRoom(request):
    if request.method == 'POST':
        try:
            data_json = json.loads(request.body)
            roomid = data_json.get("roomid")
            password = data_json.get("password")
            player2 = request.user.username
            if (join_room(roomid, password, player2)):
                return (HttpResponse("ok", status=200))
            return HttpResponse("this room is full", status=409)
        except TypeError:
            return HttpResponse("Invalid roomid", status=400)
        except ValueError:
            return HttpResponse("Invalid roomid or password", status=400)
        except KeyError:
            return HttpResponse("key error", status=400)

def searchRoom(request):
    if request.method == 'GET':
        try:
            input = request.GET.get('input')
            option = request.GET.get('option')
            if not input or not option:
                return JsonResponse({"error": "Missing 'input' or 'option' parameter"}, status=400)
            roomlist = search_room(input, option)
            return JsonResponse({"roomlist": roomlist})
        except ValueError:
            return HttpResponse("key error", status=400)

# def deleteRoom(request):
#     if request.method == 'POST':
#         n = delete_room(json.loads(request.body).get("roomid"))
#         if (n == 0):
#             return HttpResponse("Invalid roomid", status=400)
#         return HttpResponse("ok", status=200)


# def exitPlayer(request):
#     if request.method == 'POST':
#         try:
#             data_json = json.loads(request.body)
#             roomList = Room.objects.filter(player1=data_json['player'])
#             for room in roomList:
#                 room.delete()
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