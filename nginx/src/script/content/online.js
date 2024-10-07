import * as DOM from "../document.js";
import * as NET from "../network.js";
import { lang, langIndex } from "../lang.js";
import { checkUser } from "../tab.js";
import { getGamePoint } from "./feature.js";

function makeRoom(room) {
	const container = document.createElement("div");
	container.className = "window room";
	const info = document.createElement("div");
	info.className = "window room-info";

	const name = document.createElement("h4");
	name.textContent = `${room.roomname}`;
	const player = document.createElement("h6");
	player.textContent = `${room.player1}`;
	
	info.appendChild(name);
	info.appendChild(player);
	
	const password = document.createElement("div");
	password.className = "room-password";

	let label = null;
	let input = null;

	if (room.is_public === 0) {
		const inputId = `room-${room.roomname}-password-input`;

		label = document.createElement("label");
		label.className = "password";
		label.setAttribute("for", inputId);
		label.innerHTML = lang[langIndex].password;

		input = document.createElement("input");
		input.id = inputId;
		input.className = "password-input";
		input.style.width = "100%";
		input.setAttribute("type", "password");

		password.appendChild(label);
		password.appendChild(input);
	}
	
	const btn = document.createElement("button");
	btn.className = "room-btn";
	btn.textContent = lang[langIndex].enter;

	container.appendChild(info);
	container.appendChild(password);
	container.appendChild(btn);
	DOM.roomList.appendChild(container);

	btn.addEventListener("click", () => {
		try {
			const passwordStr = (input ? input.value : "");
			NET.joinRoom(room.roomid, passwordStr);
		} catch (error) {
			errorConnect();
		}
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

function errorConnect() {
	alert(lang[langIndex].failConnect);
	DOM.onlineContent.style.display = "block";
	DOM.room.style.display = "none";
	DOM.roomSetting.style.display = "none";
	DOM.clearInput(DOM.roomSetting);
	DOM.gamePoint.innerText = `${lang[langIndex].gamePoint}: `;
	sessionStorage.removeItem("isReady");
	sessionStorage.removeItem("game");
	sessionStorage.setItem("status", "online");
}

export function openRoomSetting() {
	DOM.onlineContent.style.display = "none";
	DOM.roomSetting.style.display = "block";
	sessionStorage.setItem("status", "makeRoom");
}

export function closeRoomSetting() {
	DOM.onlineContent.style.display = "block";
	DOM.roomSetting.style.display = "none";
	DOM.clearInput(DOM.roomSetting);
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
DOM.refreshBtn.addEventListener("click", () => {showRoomList();});

// open room setting
DOM.roomBtn.addEventListener("click", () => {openRoomSetting();});

// close room setting
DOM.roomCancel.addEventListener("click", () => {closeRoomSetting();});

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
	
	try {
		NET.createRoom(roomName, gamePoint, password);
		DOM.roomSetting.style.display = "none";
		DOM.onlineContent.style.display = "none";
		sessionStorage.setItem("game", "online");
	} catch (error) {
		errorConnect();
	}
});

// ready
DOM.readyBtn.addEventListener("click", () => {
	const readyStatus = sessionStorage.getItem("isReady");
	const isReady = (readyStatus ? false : true);
	if (isReady) {
		sessionStorage.setItem("isReady", "true");
		DOM.readyBtn.innerHTML = lang[langIndex].cancel;
	} else {
		sessionStorage.removeItem("isReady");
		DOM.readyBtn.innerHTML = lang[langIndex].ready;
	}
	try {
		NET.iAmReady(isReady);
	} catch (error) {
		errorConnect();
	}
});

// quit room
DOM.quitRoomBtn.addEventListener("click", () => {
	NET.quitRoom();
});