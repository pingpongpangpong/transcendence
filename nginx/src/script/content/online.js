import { checkUser } from "../tab.js";
import { online } from "./feature.js";

const roomSettingContainer = document.getElementById('room-setting');
document.getElementById('make-room').addEventListener('click', () => {
	roomSettingContainer.style.display = 'block';
});

document.getElementById('cancel-mark').addEventListener('click', function() {
	roomSettingContainer.style.display = 'none';
});

document.getElementById('cancel').addEventListener('click', () => {
	roomSettingContainer.style.display = 'none';
});

// online game
document.getElementById('m-ok').addEventListener('click', () => {
	checkUser();
	const roomName = document.getElementById('room-name').value;
	if (roomName === '') {
		alert(lang[langIndex].alRNempty);
		return;
	} else if (roomName.length < 4 || roomName.length > 20) {
		alert(lang[langIndex].alRNlen);
		return;
	}

	const gamePoint = getGamePoint('m');
	if (gamePoint < 0) {
		return;
	}

	const password = document.getElementById('password').value;
	if (password !== '') {
		if (password.length < 4) {
			alert(lang[langIndex].alPW);
			return;
		}
	}
	
	roomSettingContainer.style.display = 'none';
	document.getElementById('online').style.display = 'none';
	sessionStorage.setItem("game", "online");
	online(gamePoint);
});