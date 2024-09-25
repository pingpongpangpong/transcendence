import * as DOM from "../document.js";
import { lang, langIndex } from "../lang.js";
import { checkUser } from "../tab.js";
import { online, join } from "./feature.js";
import { getGamePoint } from "./feature.js";

function makeRoom(room) {
	const container = document.createElement("div");
	container.id = `room-${room.roomname}`;
	container.className = "window room";

	const info = document.createElement("div");
	info.id = `room-${room.roomname}-info`;
	info.className = "window room-info";

	const name = document.createElement("h4");
	name.textContent = `${room.roomname}`;
	
	const player = document.createElement("h6");
	player.textContent = `${room.player1}`;
	
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
		label.className = "password";
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
	DOM.roomList.appendChild(container);

	btn.addEventListener("click", () => {
		const body = {
			"roomid": room.roomid,
			"password": (input ? input.value : ""),
		}
		const resFunc = function (res) {
			if (res.status === 200) {
				join();
				return null;
			} else if (res.status === 409) {
				return lang[langIndex].roomIsFull;
			}
			return lang[langIndex].wrongPassword
		}
		DOM.requestPost("/game/join-room/", DOM.header, body, resFunc, alert);
	});
}

function paintRoom(uri, params) {
	let uriStr;
	if (params) {
		uriStr = `${uri}?input=${encodeURIComponent(params.input)}&option=${encodeURIComponent(params.option)}`;
	} else {
		uriStr = `${uri}`;
	}
	fetch(uriStr).then((res) => {
		if (res.status === 200) {
			return res.json();
		}
	}).then((json) => {
		const roomList = json.roomlist;
		for (let i = 0; i < roomList.length; i++) {
			makeRoom(roomList[i]);
		}
	})
}

showRoomList();

// search
DOM.searchBtn.addEventListener("click", () => {
	const str = DOM.searchInput.value;
	if (str.length === 0 || str === "") {
		return;
	}
	while (DOM.roomList.firstChild) {
		DOM.roomList.removeChild(DOM.roomList.firstChild);
	}
	const params = {
		input: DOM.searchInput.value,
		option: DOM.searchOption.value
	}
	paintRoom("/game/search-room/", params);
});

// refresh
DOM.refreshBtn.addEventListener("click", () => {
	showRoomList();
});

// open room setting
DOM.roomBtn.addEventListener("click", () => {
	openRoomSetting();
});

// close room setting
DOM.roomCancel.addEventListener("click", () => {
	closeRoomSetting();
});

// make room
DOM.roomSubmit.addEventListener("click", () => {
	checkUser();
	const roomName = DOM.roomName.value;
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

	const password = DOM.roomPassword.value;
	if (password !== "") {
		if (password.length < 4) {
			alert(lang[langIndex].alPassword);
			return;
		}
	}
	
	DOM.roomSetting.style.display = "none";
	DOM.onlineContent.style.display = "none";
	sessionStorage.setItem("game", "online");

	const body = {
		"roomname": roomName,
		"gamepoint": gamePoint,
		"password": password
	};
	const resFunc = function (res) {
		if (res.status === 200) {
			online(gamePoint, password);
			return null;
		}
		return lang[langIndex].failMakeRoom;
	}
	DOM.requestPost("/game/create-room/", DOM.header, body, resFunc, alert);
});

export function openRoomSetting() {
	DOM.onlineContent.style.display = "none";
	DOM.roomSetting.style.display = "block";
	sessionStorage.setItem("status", "makeRoom");
}

export function closeRoomSetting() {
	DOM.onlineContent.style.display = "block";
	DOM.roomSetting.style.display = "none";
	sessionStorage.setItem("status", "online");
}

export function showRoomList() {
	if (DOM.onlineContent.style.display === "none") {
		return;
	}
	while (DOM.roomList.firstChild) {
		DOM.roomList.removeChild(DOM.roomList.firstChild);
	}
	paintRoom("/game/list-room/", null);
}