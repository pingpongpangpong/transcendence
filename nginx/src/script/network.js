import * as DOM from "./document.js";
import { lang, langIndex } from "./lang.js";
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


function connect(data) {
	websocket = new WebSocket(`wss://${window.location.host}/ws/room/`);
	websocket.onopen = () => {
		websocket.send(JSON.stringify(data));
	}

	websocket.onerror = (error) => {
		console.log(error);
		console.log("WebSocket state:", websocket.readyState);
	}

	websocket.onclose = () => {
		console.log("closed");
		websocket = null;
	}
	websocket.onmessage = (event) => {
		const json = JSON.parse(event.data);
		const data = json.data;
		const type = json.type;
		console.log(json);
		switch (type) {
			case "joined":
				sessionStorage.setItem("status", "inRoom");
				DOM.clearInput(DOM.roomSetting);
				DOM.onlineContent.style.display = "none";
				DOM.room.style.display = "flex";
				DOM.hostName.innerHTML = data.player1;
				DOM.guestName.innerHTML = (data.player2 ? data.player2 : "");
				DOM.readyBtn.innerHTML = lang[langIndex].ready;
				sessionStorage.removeItem("isReady");
				break;
			case "readied":
				const hostIsReady = data.player1;
				const guestIsReady = data.player2;
				if (hostIsReady) {
					DOM.hostStatus.innerHTML = lang[langIndex].ready;
				} else {
					DOM.hostStatus.innerHTML = "";
				}
				if (guestIsReady) {
					DOM.guestStatus.innerHTML = lang[langIndex].ready;
				} else {
					DOM.guestStatus.innerHTML = "";
				}
				break;
			case "start":
				const game = new Game(data.gamepoint);
				game.onlineAwake(data.player1, data.player2);
				break;
			case "running":
				game.onlineUpdate(data);
				break;
			case "over":
				exitGame();
				break;
		}
	}
}

export function createRoom(roomName, gamePoint, password) {
	const body = {
		"type": "create",
		"data": {
			"roomname": roomName,
			"password": password,
			"goalpoint": gamePoint
		}
	};
	connect(body);
}

export function joinRoom(roomName, roomId, password) {
	const body = {
		"type": "join",
		"data": {
			"roomid": roomId,
			"password": password
		}
	};
	connect(body);
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
	DOM.room.style.display = "none";
	DOM.onlineContent.style.display = "block";
	websocket.close();
}

export function exitGame() {
	websocket.close();
	DOM.onlineContent.style.display = "block";
	DOM.room.style.display = "none";
	sessionStorage.removeItem("game");
	sessionStorage.removeItem("isReady");
	sessionStorage.setItem("status", "inRoom");
}

window.addEventListener("beforeunload", () => {
	quitRoom();
});

window.addEventListener("unload", () => {
	quitRoom();
})