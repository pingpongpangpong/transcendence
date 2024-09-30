import redis
import json
import os
import uuid

# Redis 연결 설정
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT")

r = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=0)

def save_room(roomname: str, password: str, goal_point: int, player1: str) -> uuid:
	"""
	방 정보를 Redis에 저장하는 함수

	Args:
		roomname: 방이름
		password: 비밀번호
		goal_point: 게임 승리 기준 점수
		player1: 방장

	Return:
		None
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
		'status': True,
		'ready1': False,
		'ready2': False,
		'play': False,
		'roomid': roomid
	}
    
	r.set(room_key, json.dumps(room_data))
	return roomid

def get_roomlist() -> list:
	"""
	참여 가능한 모든 방 목록을 가져오는 함수

	Args:
		None

	Return:
		list: 참여 가능한 모든 방
	"""
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

def join_room(roomid: uuid, password: int, player2: str) -> tuple:
	"""
	방 참가하는 함수

	Args:
		roomid (uuid): 방 고유 번호
		password (int): 비밀번호
		player2 (str): 고유값이 roomid에 참가하려는 참가자

	Raise:
		ValueError: roomid 또는 password가 잘못된 경우

	Return:
		tuple: 참여 성공시 (player1, player2, True), 참여 실패시 (None, None, False)
	"""
	room_key = f'room:{roomid}'
	room_json = r.get(room_key)
	room_data = json.loads(room_json)

	if not room_json:
		raise ValueError(f"Room with ID '{roomid}' not found.")

	if room_data.get("password") != password:
		raise ValueError(f"Invalid password")

	if room_data.get('player2') is None:
		room_data['player2'] = player2
		room_data['status'] = False 
		r.set(room_key, json.dumps(room_data)) 
		return room_data.get('player1'), room_data.get('player2'), True
	else:
		return None, None, False # None None bool

def search_room(input: str, option: str) -> list:
	"""
	해당 option의 input값인 방 검색하는 함수

	Args:
		input (str): 검색어
		option (str): 검색옵션 (방제, 방장ID)

	Raise:
		ValueError: option이 규칙에 어긋난 경우

	Return:
		list: 검색하여 나온 방 리스트 
	"""
	keys = r.keys('room:*')
	matching_rooms = []

	search_field = None
	if option == 'user':
		search_field = 'player1'
	elif option == 'room':
		search_field = 'roomname'
	else:
		raise ValueError("error Invalid 'option' value. Use 'user' or 'room'.")

	for key in keys:
		room_data = json.loads(r.get(key))
		
		field_value = room_data.get(search_field)
		if field_value and input in str(field_value):
			matching_rooms.append(room_data)
	return matching_rooms

def delete_room(roomid: uuid) -> bool:
	if r.delete(f'room:{roomid}'):
		return True
	return False

def leave_room(roomid: uuid, username: str) -> tuple:
	"""
	참여자 또는 방장이 방을 나갔을 때

	Args:
		roomid (uuid): 방 고유번호
		username (str): 나간 유저 아이디

	Raise:
		ValueError: 입력값이 틀렸을때

	Return:
		tuple: player1, player2
	"""
	if (r.exists(f'room:{roomid}') != False):
		raise ValueError("Invalid roomid")
	room_data = json.loads(r.get(f'room:{roomid}'))
	host = room_data.get('player1')
	participants = room_data.get('player2')

	if (username != host and username != participants):
		raise ValueError("Invalid username")

	if (username == participants):
		room_data['player1'] = participants

	room_data['player2'] = None
	room_data['status'] = True
	room_data['ready1'] = False
	room_data['ready2'] = False

	if (username == host and participants == None):
		delete_room(roomid)
		room_data['player1'] = None
	else:
		r.set(f'room:{roomid}', room_data)

	return room_data.get('player1'), room_data.get('player2')


def start_game(roomid: uuid, play: bool) -> dict:
	"""
	게임 시작 버튼을 눌렀을때 상태값을 변경하는 함수

	Args:
		roomid (uuid): 방 고유 번호
		play: 시작시 True

	Raise:
		ValueError: 입력값이 틀렸을 때

	Return:
		dict: {player1, player2, goal_point}
	"""
	if (r.exists(f'room:{roomid}') != False):
		raise ValueError("Invalid roomid")
	room_data = json.loads(r.get(f'room:{roomid}'))
	room_data['play'] = play
	r.set(f'room:{roomid}', room_data)

	result = {
		'player1': room_data.get('player1'),
		'player2': room_data.get('player2'),
		'goal_point': room_data.get('goal_point')
		}
	return result

def ready_game(roomid: uuid, role: str, ready: bool) -> tuple:
	"""
	플레이어가 방에서 준비를 눌렀을때 상태값을 변경하는 함태

	Args:
		roomid (uuid): 방 고유 번호
		role (str): 누른 사람이 player1, player2인지
		ready (bool): 준비했는지 취소했는지

		Raise:
		ValueError: 입력값이 틀렸을 때

		Return:
		tuple: player1과 player2의 'ready'상태 값 반환
	"""
	if (r.exists(f'room:{roomid}') != False):
		raise ValueError("Invalid roomid")
	if (role != 'player1' and role != 'player2'):
		raise ValueError("Invalid role")

	room_data = json.loads(r.get(f'room:{roomid}'))
	if (role == 'player1'):
		room_data['ready1'] = ready
	if (role == 'player2'):
		room_data['ready2'] = ready

	r.set(f'room:{roomid}', room_data)
	return room_data.get('ready1'), room_data.get('ready2')