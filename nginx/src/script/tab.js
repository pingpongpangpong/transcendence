import * as DOM from "./document.js";
import * as NET from "./network.js";
import { closeBracket } from "./content/feature.js";
import { logout, toContent, toSignup } from "./login.js";
import { exit } from "./object/game.js";
import { closeRoomSetting, openRoomSetting, showRoomList } from "./content/online.js";
import { lang, langIndex } from "./lang.js";
import { onlineGameExit } from "./object/onlineGame.js";

export function onOffline() {
	DOM.offlineContent.style.display = "block";
	DOM.tournamentContent.style.display = "none";
	DOM.onlineContent.style.display = "none";
	sessionStorage.setItem("status", "offline");
	sessionStorage.removeItem("game");
}

function onTournament() {
	DOM.offlineContent.style.display = "none";
	DOM.tournamentContent.style.display = "block";
	DOM.onlineContent.style.display = "none";
	DOM.room.style.display = "none";
	sessionStorage.setItem("status", "tournament");
	sessionStorage.removeItem("game");
}

function onOnline() {
	DOM.offlineContent.style.display = "none";
	DOM.tournamentContent.style.display = "none";
	DOM.onlineContent.style.display = "block";
	showRoomList();
	sessionStorage.setItem("status", "online");
	sessionStorage.removeItem("game");
}

function moveTo(where) {
	checkUser();
	removeValue();
	exit();
	closeBracket();
	closeRoomSetting();
	DOM.room.style.display = "none";
	const isGame = sessionStorage.getItem("game");
	const isRoom = sessionStorage.getItem("status");
	if (isGame) {
		NET.exitGame();
	} else if (isRoom === "inRoom") {
		NET.quitRoom();
	}
	if (NET.websocket) {
		NET.websocket.send(JSON.stringify({ "type": "leave", "data": null }));
		onlineGameExit();
	}
	where();
}

export function removeValue() {
	DOM.tournamentSelectNum.options[0].selected = true;
	while (DOM.tournamentInput.firstChild) {
		DOM.tournamentInput.removeChild(DOM.tournamentInput.firstChild);
	}
	while (DOM.tournamentBtn.firstChild) {
		DOM.tournamentBtn.removeChild(DOM.tournamentBtn.firstChild);
	}
	if (DOM.roomSetting.style.display === "block") {
		DOM.roomSetting.style.display = "none";
	}
	const inputList = document.getElementsByTagName("input");
	for (let i = 0; i < inputList.length; i++) {
		if (inputList[i].className === "game-point") {
			inputList[i].value = "10";
		} else {
			inputList[i].value = "";
		}
	}
}

export function checkUser() {
	fetch("/user/check/").then((res) => {
		if (res.status === 200) {
			return;
		} else if (res.status === 403) {
			fetch("/user/refresh/").then((res) => {
				if (res.status !== 200) {
					alert(lang[langIndex].invalidTsubmiten);
					removeValue();
					exit();
					closeBracket();
					logout();
				}
			});
		} else {
			alert(lang[langIndex].invalidTsubmiten);
			removeValue();
			exit();
			closeBracket();
			logout();
		}
	});
}

DOM.offlineTab.addEventListener("click", () => {
	moveTo(onOffline);
});

DOM.tournamentTab.addEventListener("click", () => {
	moveTo(onTournament);
});

DOM.onlineTab.addEventListener("click", () => {
	moveTo(onOnline);
});

window.addEventListener("load", () => {
	const status = sessionStorage.getItem("status");
	DOM.signContainer.style.display = "none";
	DOM.signinContent.style.display = "none";
	if (status === null) {
		logout();
	} else if (status === DOM.pageStatus[0]) {
		logout();
	} else if (status === DOM.pageStatus[1]) {
		toSignup();
	} else {
		const resFunc = function (res) {
			if (res.status !== 200) {
				logout();
				throw lang[langIndex].invalidTsubmiten;
			}
			const status = sessionStorage.getItem("status");
			const game = sessionStorage.getItem("game");
			if (status === DOM.pageStatus[2] || game === DOM.pageStatus[2]) {
				toContent(onOffline);
			} else if (status === DOM.pageStatus[3] || game === DOM.pageStatus[3]) {
				toContent(onTournament);
			} else if (status === DOM.pageStatus[4] || game === DOM.pageStatus[4]) {
				toContent(onOnline);
			} else if (status === DOM.pageStatus[5]) {
				toContent(onOnline);
				openRoomSetting();
			} else if (status === DOM.pageStatus[6]) {
				toContent(onOnline);
			}
			return null;
		}
		NET.requestGet("/user/check/", resFunc, alert);
	}
});