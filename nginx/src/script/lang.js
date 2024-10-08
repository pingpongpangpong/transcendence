import * as DOM from "./document.js";

export let lang = {};
export let langIndex = "ko";

export function changeLang() {
	// header
	document.querySelector(".title-bar-text").innerText = lang[langIndex].title;
	DOM.logoutBtn.innerHTML = lang[langIndex].logout;
	// sign buttons
	DOM.signinBtn.innerHTML = lang[langIndex].signin;
	DOM.oauthBtn.innerHTML = lang[langIndex].signin42;
	DOM.signupBtn.innerHTML = lang[langIndex].signup;
	// sign up
	DOM.signupCheckPasswordLabel.innerHTML = lang[langIndex].checkPassword;
	DOM.signupEmailLabel.innerHTML = lang[langIndex].email;
	DOM.signupEmailInfo.innerText = lang[langIndex].emailInfo;
	DOM.signupCodeLabel.innerHTML = lang[langIndex].code;
	DOM.signupCodeSubmit.innerHTML = lang[langIndex].checkEmail;
	DOM.signupCancel.innerHTML = lang[langIndex].goBack;
	// offline
	document.querySelector("#offline-tab a").innerText = lang[langIndex].offline;
	document.querySelector("#tournament-tab a").innerText = lang[langIndex].tournament;
	document.querySelector("#online-tab a").innerText = lang[langIndex].online;
	DOM.offlineInfo.innerText = lang[langIndex].lSet;
	DOM.offlineInput1Label.innerText = `1${lang[langIndex].playerName}`;
	DOM.offlineInput2Label.innerText = `2${lang[langIndex].playerName}`;
	// tournament
	DOM.tournamentInfo.innerText = lang[langIndex].tSet;
	DOM.tournamentPeopleNum.innerText = lang[langIndex].nPeople;
	DOM.index.innerText = lang[langIndex].select;
	// online
	DOM.searchOptionRoom.innerHTML = lang[langIndex].roomName;
	DOM.searchOptionUser.innerHTML = lang[langIndex].id;
	DOM.searchBtn.innerHTML = lang[langIndex].search;
	DOM.refreshBtn.innerHTML = lang[langIndex].refresh;
	DOM.roomBtn.innerText = lang[langIndex].roomMake;
	DOM.roomInfo.innerText = lang[langIndex].mSet;
	DOM.roomNameLabel.innerText = lang[langIndex].roomName;
	DOM.roomCancel.innerHTML = lang[langIndex].cancel;
	//room
	const isReady = sessionStorage.getItem("isReady");
	DOM.readyBtn.innerHTML = (isReady ? lang[langIndex].cancel : lang[langIndex].ready);
	DOM.quitRoomBtn.innerHTML = lang[langIndex].quit;
	// footer
	DOM.gamePoint.innerText = `${lang[langIndex].gamePoint}: `;
	
	const idText = document.querySelectorAll(".id");
	for (let i = 0; i < idText.length; i++) {
		idText[i].innerHTML = lang[langIndex].id;
	}
	const codeText = document.querySelectorAll(".code");
	for (let i = 0; i < codeText.length; i++) {
		codeText[i].innerHTML = lang[langIndex].varify;
	}
	const codeLabel = document.querySelectorAll(".code-label");
	for (let i = 0; i < codeLabel.length; i++) {
		codeLabel[i].innerHTML = lang[langIndex].code;
	}
	const submits = document.querySelectorAll(".submit");
	for (let i = 0; i < submits.length; i++) {
		submits[i].innerHTML = lang[langIndex].submit;
	}
	const gamePointText = document.querySelectorAll(".game-point-text");
	for (let i = 0; i < gamePointText.length; i++) {
		gamePointText[i].innerHTML = lang[langIndex].gamePoint;
	}
	const passwordText = document.querySelectorAll(".password");
	for(let i = 0; i < passwordText.length; i++) {
		passwordText[i].innerHTML = lang[langIndex].password;
	}
	const playerLables = document.querySelectorAll(".player");
	if (playerLables) {
		for(let i = 0; i < playerLables.length; i++) {
			playerLables[i].textContent = `${i + 1}${lang[langIndex].playerName}`;
		}
	}
	const joinBtns = document.querySelectorAll(".room-btn");
	if (joinBtns) {
		for (let i = 0; i < joinBtns.length; i++) {
			joinBtns[i].innerHTML = lang[langIndex].enter;
		}
	}
}

DOM.langSelect.addEventListener("change", (e) => {
	langIndex = e.target.value;
	sessionStorage.setItem("lang", langIndex);
	changeLang();
});

window.addEventListener("beforeunload", () => {
	sessionStorage.setItem("lang", langIndex);
});

window.onload = function () {
	const langJson = sessionStorage.getItem("langJson");
	if (langJson === null) {
		fetch("../lang.json")
		.then((response) => response.json())
		.then((json) => {
			lang = json;
			sessionStorage.setItem("langJson", JSON.stringify(lang));
		})
	} else {
		lang = JSON.parse(langJson);
		const prevIndex = sessionStorage.getItem("lang");
		langIndex = prevIndex ? prevIndex : "ko";
		DOM.langSelect.value = langIndex;
		changeLang();
	}

	const signinStatus = sessionStorage.getItem("auth");
	if (signinStatus === null) {
		DOM.signinInput.style.display = "grid";
		DOM.oauthInput.style.display = "none";
		return;
	}
	const params = new URLSearchParams(window.location.search);
	const authStatus = params.get("Oauth");
	if (authStatus === "Success") {
		DOM.signinInput.style.display = "none";
		DOM.oauthInput.style.display = "grid";
	} else {
		DOM.signinInput.style.display = "grid";
		DOM.oauthInput.style.display = "none";
	}

	const langItem = sessionStorage.getItem("lang");
	if (langItem) {
		langIndex = langItem;
		DOM.langSelect.value = langIndex;
		changeLang();
	}
}