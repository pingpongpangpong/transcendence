from django.http import JsonResponse, HttpResponse
from .room_manager import get_roomlist, search_room

def listRoom(request):
    if request.method == 'GET':
        try:
            room_list = get_roomlist()
            return JsonResponse({"roomlist": room_list})
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