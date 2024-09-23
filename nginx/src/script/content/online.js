import { lang, langIndex } from "../lang.js";
import { checkUser } from "../tab.js";
import { online } from "./feature.js";
import { getGamePoint } from "./feature.js";

const onlineContainer = document.getElementById("online");
const roomSettingContainer = document.getElementById("room-setting");
const roomListContainer = document.getElementById("room-list");

// room list
function showRoomList() {
	if (onlineContainer.style.display === "none") {
		return;
	}
	while (roomListContainer.firstChild) {
		roomListContainer.removeChild(roomListContainer.firstChild);
	}
	fetch("/game/list-room/").then((response) => {
		if (response.status === 200) {
			return response.json();
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
	
	const password = document.createElement("div");
	password.id = `room-${room.roomname}-password`;
	password.className = "room-password";

	let label = null;
	let input = null;

	if (room.is_public === 0) {
		const inputId = `room-${room.roomname}-password-input`;

		label = document.createElement("label");
		label.id = `room-${room.roomname}-password-label`;
		label.class = "password";
		label.setAttribute("for", inputId);
		label.innerHTML = lang[langIndex].password;

		input = document.createElement("input");
		input.id = inputId;
		input.className = "password-input";
		input.setAttribute("type", "password");

		password.appendChild(label);
		password.appendChild(input);
	}
	
	const btn = document.createElement("button");
	btn.id = `room-${room.roomname}-btn`;
	btn.className = "room-btn";
	btn.textContent = lang[langIndex].enter;

	container.appendChild(info);
	container.appendChild(password);
	container.appendChild(btn);
	roomListContainer.appendChild(container);

	btn.addEventListener("click", () => {
		const uri = "/game/join-room/";
		const password = (input === null ? null : input.value);
		const body = {
			"roomid": room.roomid,
			"password": password
		}
		fetch(uri, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body)
		}).then((response) => {
			if (response.status === 200) {
				console.log("join");
			} else {
				alert(response.body.json());
			}
		});
	});
}

showRoomList();

// refresh
document.getElementById("refresh-btn").addEventListener("click", () => {
	showRoomList();
});

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

// make room
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

	const uri = "/game/create-room/";
	const body = {
		"roomname": roomName,
		"gamepoint": gamePoint,
		"password": password
	};
	fetch(uri, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body)
	}).then((response) => {
		if (response.status === 200) {
			online(gamePoint);
		} else {
			alert(response.body.json());
		}
	});
});

export function closeRoomSetting() {
	roomSettingContainer.style.display = "none";
}