import { checkUser } from "../tab.js";
import { offline, getGamePoint, checkName } from "./feature.js";

document.getElementById("offline-submit").addEventListener("click", () => {
	checkUser();
	const gamePoint = getGamePoint("offline");
	if (gamePoint < 0) {
		return;
	}

	const name1 = document.getElementById("name-input1").value;
	const name2 = document.getElementById("name-input2").value;
	if (!checkName(name1, 1)) {
		return;
	}
	if (!checkName(name2, 2)) {
		return;
	}
	if (name1 === name2) {
		alert(`1${lang[langIndex].alPNsame1}2${lang[langIndex].alPNsame2}`);
		return;
	}
	
	document.getElementById("offline").style.display = "none";
	sessionStorage.setItem("game", "offline");
	offline(gamePoint, name1, name2);
});