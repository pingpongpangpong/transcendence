import redis
import json
import os
import uuid

# Redis 연결 설정
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")

r = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=0)

def save_room(roomname, password, goal_point, player1) -> None:
	"""
	방 정보를 redis에 저장함
	"""
	roomid = str(uuid.uuid4())
	room_key = f'room:{roomid}'
	if (password == ''):
		is_public = 1
	else:
		is_public = 0

	room_data = {
		'roomname': roomname,
		'password': password,
		'goal_point': goal_point,
		'is_public': is_public,
		'player1': player1,
		'player2': None,
		'status': True, # 들어올 수 있냐
		'roomid': roomid
	}
    
	# room:<roomname> 형식으로 저장
	r.set(room_key, json.dumps(room_data))

def get_roomlist() -> list:
	# Redis에서 모든 방 목록 가져오기 (room:*로 저장된 항목들)
	keys = r.keys('room:*')
	room_list = []

	for key in keys:
		room_json = r.get(key)
		room_data = json.loads(room_json)
		if room_data.get('status') == True:
			filtered_room = {
				'roomname': room_data.get('roomname'),
				'roomid':room_data.get('roomid'),
				'is_public': room_data.get('is_public'),
				'player1': room_data.get('player1')
			}
			room_list.append(filtered_room)
	return room_list

def join_room(roomid, password, player2) -> bool:
	"""
	고유 식별자를 사용하여 방에 참가하는 함수.
	"""
	# 방 정보 가져오기 (고유 식별자 사용)
	room_key = f'room:{roomid}'
	room_json = r.get(room_key)
	room_data = json.loads(room_json)

	if not room_json:
		raise ValueError(f"Room with ID '{roomid}' not found.")

	if room_data.get("password") != password:
		raise ValueError(f"Invalid password")

	# player2가 None이면 방에 참가할 수 있음
	if room_data.get('player2') is None:
		room_data['player2'] = player2
		room_data['status'] = False  # 방에 참가하면 상태를 "full"로 업데이트
		r.set(room_key, json.dumps(room_data))  # Redis에 업데이트된 방 정보 저장
		return True  # 성공적으로 참가
	else:
		return False  # 이미 다른 플레이어가 있어서 참가할 수 없음

def search_room(roomname:str):
	keys = r.keys('room:*')
	matching_rooms = []

	for key in keys:
		room_data = json.loads(r.get(key))
		if roomname in room_data['roomname']:
			matching_rooms.append(room_data)
	return matching_rooms