import * as DOM from "../document.js";
import { checkUser } from "../tab.js";
import { offline, getGamePoint, checkName } from "./feature.js";
import { lang, langIndex } from "../lang.js";

DOM.offlineSubmit.addEventListener("click", () => {
	checkUser();
	const gamePoint = getGamePoint("offline");
	if (gamePoint < 0) {
		return;
	}
	const name1 = DOM.offlineInput1.value;
	const name2 = DOM.offlineInput2.value;
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
	
	DOM.offlineContent.style.display = "none";
	offline(gamePoint, name1, name2);
});