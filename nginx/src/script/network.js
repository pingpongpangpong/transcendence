import * as DOM from "./document.js";
import { lang } from "./lang";
import { Game } from "./object/game.js";

export const header = {
	"Content-Type": "application/json",
};

export function getCookie(name) {
	let value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
	return value? value[2] : null;
}

export function requestGet(uri, resFunc, errFunc) {
	fetch(uri).then((res) => resFunc(res)).catch((err) => errFunc(err));
}

export function requestPost(uri, header, body, resFunc, errFunc) {
	fetch(uri, {
		method: "POST",
		headers: header,
		body: JSON.stringify(body)
	}).then((res) => resFunc(res)).catch((err) => errFunc(err));
}

export let websocket = null;

function connect(roomName) {
	websocket = new WebSocket(`wss://${window.location.host}/ws/${roomName}/`);
	if (websocket === null) {
		throw alert(lang[langIndex].failConnect);
	}
	websocket.onclose = () => {
		websocket = null;
	}
	websocket.onmessage = (event) => {
		const json = JSON.parse(event.data);
		const body = json.data;
		switch (body.type) {
			case "joined":
				sessionStorage.setItem("status", "inRoom");
				DOM.clearInput(DOM.roomSetting);
				DOM.onlineContent.style.display = "none";
				DOM.room.style.display = "flex";
				DOM.hostName.innerHTML = body.player1;
				DOM.guestName.innerHTML = (body.player2 ? body.player2 : "");
				DOM.readyBtn.innerHTML = lang[langIndex].ready;
				sessionStorage.removeItem("isReady");
				break;
			case "readied":
				const readyStatus = sessionStorage.getItem("isReady");
				const isReady = (readyStatus ? false : true);
				if (isReady) {
					sessionStorage.removeItem("isReady");
					DOM.readyBtn.innerHTML = lang[langIndex].ready;
				} else {
					sessionStorage.setItem("isReady", "true");
					DOM.readyBtn.innerHTML = lang[langIndex].cancel;
				}
				break;
			case "start":
				const game = new Game(body.gamepoint);
				game.onlineAwake(body.player1, body.player2);
				break;
			case "running":
				game.onlineUpdate(game);
				break;
			case "over":
				exitGame();
				break;
		}
	}
}

export function createRoom(roomName, gamePoint, password) {
	connect(roomName);
	const body = {
		"type": "create",
		"data": {
			"roomname": roomName,
			"password": password,
			"goalpoint": gamePoint
		}
	};
	websocket.send(JSON.stringify(body));
}

export function joinRoom(roomName, roomId, password) {
	connect(roomName);
	const body = {
		"type": "join",
		"data": {
			"roomid": roomId,
			"password": password
		}
	};
	websocket.send(JSON.stringify(body));
}

export function iAmReady(isReady) {
	const body = {
		"type": "ready",
		"data": {
			"value": isReady
		}
	};
	websocket.send(JSON.stringify(body));
}

export function quitRoom() {
	const body = {
		"type": "leave",
		"data": null
	};
	websocket.send(JSON.stringify(body));
	sessionStorage.removeItem("game");
	sessionStorage.removeItem("isReady");
	sessionStorage.setItem("status", "online");
}

export function exitGame() {
	websocket.close();
	websocket = null;
	DOM.onlineContent.style.display = "block";
	DOM.room.style.display = "none";
	sessionStorage.removeItem("game");
	sessionStorage.removeItem("isReady");
	sessionStorage.setItem("status", "inRoom");
}

window.addEventListener("beforeunload", () => {
	quitRoom();
	websocket.close();
	websocket = null;
});

window.addEventListener("unload", () => {
	quitRoom();
	websocket.close();
	websocket = null;
})