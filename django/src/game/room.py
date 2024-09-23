import redis
import json
import os
import uuid

# Redis 연결 설정
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")

r = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=0)

def save_room_to_redis(roomname, password, goal_point, player1):
	"""
	방 정보를 redis에 저장함
	"""
	unique_id = str(uuid.uuid4())
	room_key = f'room:{roomname}:{unique_id}'
	if (password == None):
		is_public = True
	else:
		is_public = False

	room_data = {
		'roomname': roomname,
		'password': password,
		'goal_point': goal_point,
		'is_public': is_public,
		'player1': player1,
		'player2': None,
		'status': True,
		'unique_id': unique_id
	}
    
    # room:<roomname> 형식으로 저장
	r.set(room_key, json.dumps(room_data))

def get_roomlist_from_redis():
	# Redis에서 모든 방 목록 가져오기 (room:*로 저장된 항목들)
	keys = r.keys('room:*')
	room_list = []

	for key in keys:
		room_json = r.get(key)
		room_data = json.loads(room_json)
		filtered_room = {
			'roomname': room_data.get('roomname'),
			'is_public': room_data('is_public'),
			'player1': room_data('player1')
		}
		room_list.append(filtered_room)

	return room_list

# def join_room():
# 	r