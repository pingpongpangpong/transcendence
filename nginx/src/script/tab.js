import { closeBracket } from "./content/feature.js";
import { changeToLoginPage } from "./login.js";
import { exit } from "./object/game.js";

const offlineContent = document.getElementById('offline');
const tournamentContent = document.getElementById('tournament');
const onlineContent = document.getElementById('online');

document.getElementById('l-tab').addEventListener('click', () => {
	checkUser();
	offlineContent.style.display = 'block';
	tournamentContent.style.display = 'none';
	onlineContent.style.display = 'none';
	removeValue();
	exit();
	closeBracket();
});

document.getElementById('t-tab').addEventListener('click', () => {
	checkUser();
	offlineContent.style.display = 'none';
	tournamentContent.style.display = 'block';
	onlineContent.style.display = 'none';
	removeValue();
	exit();
	closeBracket();
});

document.getElementById('m-tab').addEventListener('click', () => {
	checkUser();
	offlineContent.style.display = 'none';
	tournamentContent.style.display = 'none';
	onlineContent.style.display = 'block';
	removeValue();
	exit();
	closeBracket();
});

export function removeValue() {
	const select = document.getElementById('select-num');
	select.options[0].selected = true;
	
	const tournamentInputList = document.getElementById('input-list');
	if (tournamentInputList.childNodes.length !== 0) {
		while (tournamentInputList.firstChild) {
			tournamentInputList.removeChild(tournamentInputList.firstChild);
		}
	}

	const tournamentStartButton = document.getElementById('t-button');
	while (tournamentStartButton.firstChild) {
		tournamentStartButton.removeChild(tournamentStartButton.firstChild);
	}

	const roomSetting = document.getElementById('room-setting');
	if (roomSetting.style.display === 'block') {
		roomSetting.style.display = 'none';
	}


	const inputList = document.getElementsByTagName('input');
	for (let i = 0; i < inputList.length; i++) {
		if (inputList[i].className === 'game-point') {
			inputList[i].value = '10';
		} else {
			inputList[i].value = '';
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
			changeToLoginPage();
		}
	});
}