import { checkUser } from "../tab.js";
import { online } from "./feature.js";
import { getGamePoint } from "./feature.js";

const onlineContainer = document.getElementById("online");
const roomSettingContainer = document.getElementById("room-setting");

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

// start online game
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
	online(gamePoint);
});

export function closeRoomSetting() {
	roomSettingContainer.style.display = "none";
}