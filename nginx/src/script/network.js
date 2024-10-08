import * as DOM from "./document.js";
import { lang, langIndex } from "./lang.js";
import { showRoomList } from "./content/online.js";
import { Online, onlineGameExit } from "./object/onlineGame.js";

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
let game = null;
let player1Name = "";
let player2Name = "";
let gamePoint = 0;

function isKey(event) {
	if (event.key === "ArrowUp") {
		return "up";
	} else if (event.key === "ArrowDown") {
		return "down";
	}
	return "";
}

const keyDown = (event) => {
	const body = {
		"type": "input",
		"data": {
			"input": isKey(event),
			"value": true
		}
	};
	websocket.send(JSON.stringify(body));
}

const keyUp = (event) => {
	const body = {
		"type": "input",
		"data": {
			"input": isKey(event),
			"value": false
		}
	};
	websocket.send(JSON.stringify(body));
}

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
		websocket = null;
		window.removeEventListener("keydown", keyDown);
		window.removeEventListener("keyup", keyUp);
		closeGame();
	}
	websocket.onmessage = (event) => {
		const json = JSON.parse(event.data);
		const data = json.data;
		const type = json.type;
		switch (type) {
			case "joined":
				sessionStorage.setItem("status", "inRoom");
				DOM.clearInput(DOM.roomSetting);
				DOM.onlineContent.style.display = "none";
				DOM.room.style.display = "flex";
				DOM.hostName.innerHTML = data.player1;
				DOM.guestName.innerHTML = (data.player2 ? data.player2 : "");
				DOM.hostStatus.innerHTML = (data.ready1 ? lang[langIndex].ready : "");
				DOM.guestStatus.innerHTML = (data.ready2 ? lang[langIndex].ready : "");
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
				if (hostIsReady && guestIsReady) {
					DOM.room.style.display = "none";
				}
				break;
			case "start":
				sessionStorage.setItem("game", "online");
				player1Name = data.player1;
				player2Name = data.player2;
				gamePoint = data.goalpoint;
				DOM.player1Score.innerHTML = `${player1Name}: `;
				DOM.player2Score.innerHTML = `${player2Name}: `;
				DOM.gamePoint.innerHTML = `${lang[langIndex].gamePoint}: ${gamePoint}`;
				game = new Online(data.gamepoint);
				game.awake();
				window.addEventListener("keydown", keyDown);
				window.addEventListener("keyup", keyUp);
				game.update();
				break;
			case "running":
				DOM.player1Score.innerHTML = `${player1Name}: ${data.player1.score}`;
				DOM.player2Score.innerHTML = `${player2Name}: ${data.player2.score}`;
				game.leftPlayer.position.x = data.player1.position.x;
				game.leftPlayer.position.y = data.player1.position.y;
				game.rightPlayer.position.x = data.player2.position.x;
				game.rightPlayer.position.y = data.player2.position.y;
				game.ball.position.x = data.ball.position.x;
				game.ball.position.y = data.ball.position.y;
				break;
			case "over":
				exitGame(data);
				break;
			default:
				console.log(json);
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

export function joinRoom(roomId, password) {
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
	closeGame();
	DOM.onlineContent.style.display = "block";
	sessionStorage.setItem("status", "online");
	websocket.close();
}

export function exitGame(data) {
	alert(`${data.winner}${lang[langIndex].win}`);
	websocket.close();
	onlineGameExit();
	closeGame();
	DOM.onlineContent.style.display = "block";
	sessionStorage.setItem("status", "inRoom");
}

function closeGame() {
	sessionStorage.removeItem("game");
	sessionStorage.removeItem("isReady");
	DOM.hostStatus.innerHTML = "";
	DOM.guestStatus.innerHTML = "";
	DOM.room.style.display = "none";
	showRoomList();
}

window.addEventListener("beforeunload", () => {
	quitRoom();
});

window.addEventListener("unload", () => {
	quitRoom();
})