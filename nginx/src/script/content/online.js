import { lang, langIndex } from "../lang.js";
import { checkUser } from "../tab.js";
import { online } from "./feature.js";
import { getGamePoint } from "./feature.js";

const onlineContainer = document.getElementById("online");
const roomSettingContainer = document.getElementById("room-setting");
const roomListContainer = document.getElementById("room-list");

// room list
function showRoomList() {
	while (roomListContainer.firstChild) {
		roomListContainer.removeChild(roomListContainer.firstChild);
	}
	fetch("/list-room/").then((response) => {
		if (response.status === 200) {
			return response.json();
		} else {
			alert("방을 불러오는데 실패 했습니다.");
		}
	}).then((json) => {
		const roomList = json.roomlist;
		roomList.foreach((room) => {
			makeRoom(room);
		});
	});
}

function makeRoom(room) {
	const container = document.createElement("div");
	container.id = `room-${room.roomname}`;
	container.className = "window room";

	const info = document.createElement("div");
	info.id = `room-${room.roomname}-info`;
	info.className = "window room-info";

	const name = document.createElement("h4");
	name.textContent = `${lang[langIndex].roomName}: ${room.roomname}`;
	
	const player = document.createElement("h6");
	player.textContent = `${lang[langIndex].roomHost}: ${room.player1}`;

	info.appendChild(name);
	info.appendChild(player);

	const btn = document.createElement("button");
	btn.id = `room-${room.roomname}-btn`;
	btn.className = "room-btn";
	btn.textContent = lang[langIndex].enter;

	container.appendChild(info);
	container.appendChild(btn);
	roomListContainer.appendChild(container);
}

showRoomList();

// open room setting
document.getElementById("make-room-btn").addEventListener("click", () => {
	onlineContainer.style.display = "none";
	roomSettingContainer.style.display = "block";
});

// close room setting
document.getElementById("online-room-cancel").addEventListener("click", () => {
	onlineContainer.style.display = "block";
	closeRoomSetting();
});

// start online game
document.getElementById("online-room-submit").addEventListener("click", () => {
	checkUser();
	const roomName = document.getElementById("online-room-name").value;
	if (roomName === "") {
		alert(lang[langIndex].alRNempty);
		return;
	} else if (roomName.length < 4 || roomName.length > 20) {
		alert(lang[langIndex].alRNlen);
		return;
	}

	const gamePoint = getGamePoint("online");
	if (gamePoint < 0) {
		return;
	}

	const password = document.getElementById("online-password").value;
	if (password !== "") {
		if (password.length < 4) {
			alert(lang[langIndex].alPassword);
			return;
		}
	}
	
	roomSettingContainer.style.display = "none";
	document.getElementById("online").style.display = "none";
	sessionStorage.setItem("game", "online");
	online(gamePoint);
});

export function closeRoomSetting() {
	roomSettingContainer.style.display = "none";
}