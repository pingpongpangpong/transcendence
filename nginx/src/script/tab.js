import { closeBracket } from "./content/feature.js";
import { logout, toContent, toSignup, undo } from "./login.js";
import { exit } from "./object/game.js";

const sign = document.getElementById("sign");
const signin = document.getElementById("sign-in-content");
const signup = document.getElementById("sign-upcontent");
const windowContainer = document.getElementById("window-content");
const offlineContent = document.getElementById("offline");
const tournamentContent = document.getElementById("tournament");
const onlineContent = document.getElementById("online");

const pageStatus = {
	0: "signin",
	1: "signup",
	2: "offline",
	3: "tournament",
	4: "online",
	5: "ongame",
};

function onOffline() {
	offlineContent.style.display = "block";
	tournamentContent.style.display = "none";
	onlineContent.style.display = "none";
	sessionStorage.setItem("status", "offline");
}

function onTournament() {
	offlineContent.style.display = "none";
	tournamentContent.style.display = "block";
	onlineContent.style.display = "none";
	sessionStorage.setItem("status", "tournament");
}

function onOnline() {
	offlineContent.style.display = "none";
	tournamentContent.style.display = "none";
	onlineContent.style.display = "block";
	sessionStorage.setItem("status", "online");
}

document.getElementById("l-tab").addEventListener("click", () => {
	checkUser();
	onOffline();
	removeValue();
	exit();
	closeBracket();
});

document.getElementById("t-tab").addEventListener("click", () => {
	checkUser();
	onTournament();
	removeValue();
	exit();
	closeBracket();
});

document.getElementById("m-tab").addEventListener("click", () => {
	checkUser();
	onOnline();
	removeValue();
	exit();
	closeBracket();
});

window.addEventListener("load", () => {
	const status = sessionStorage.getItem("status");
	const game = sessionStorage.getItem("game");
	sign.style.display = "none";
	signin.style.display = "none";
	if (status === null) {
		console.log(status, game);
		logout();
	} else if (status === pageStatus[0]) {
		undo();
	} else if (status === pageStatus[1]) {
		toSignup();
	} else {
		fetch("/user/check/").then((response) => {
			if (response.status !== 200) {
				alert("로그인 페이지로 돌아갑니다.");
				undo();
			} else if (status === pageStatus[2] || game === pageStatus[2]) {
				toContent();
				onOffline();
			} else if (status === pageStatus[3] || game === pageStatus[3]) {
				toContent();
				onTournament();
			} else if (status === pageStatus[4] || game === pageStatus[4]) {
				toContent();
				onOnline();
			}
		});
	}
});

export function removeValue() {
	const select = document.getElementById("select-num");
	select.options[0].selected = true;
	
	const tournamentInputList = document.getElementById("input-list");
	if (tournamentInputList.childNodes.length !== 0) {
		while (tournamentInputList.firstChild) {
			tournamentInputList.removeChild(tournamentInputList.firstChild);
		}
	}

	const tournamentStartButton = document.getElementById("t-button");
	while (tournamentStartButton.firstChild) {
		tournamentStartButton.removeChild(tournamentStartButton.firstChild);
	}

	const roomSetting = document.getElementById("room-setting");
	if (roomSetting.style.display === "block") {
		roomSetting.style.display = "none";
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
	const uri = "/user/check/";
	fetch(uri).then((response) => {
		if (response.status !== 200) {
			alert("세션이 만료되어 로그인이 필요합니다.");
			removeValue();
			exit();
			closeBracket();
			logout();
		}
	});
}