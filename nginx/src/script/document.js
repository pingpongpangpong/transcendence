// sign
export const signContainer = document.getElementById("sign");
// sign in
export const signinContent = document.getElementById("sign-in-content");
export const signinBtn = document.getElementById("sign-in-btn");
export const signinInput = document.getElementById("sign-in-input");
export const signinId = document.getElementById("sign-in-id");
export const signinPassword = document.getElementById("sign-in-password");
export const signinSubmitBtn = document.getElementById("sign-in-submit");
// 2 factor
export const signin2factor = document.getElementById("sign-in-2factor");
export const signinCodeLabel = document.getElementById("sign-in-code-label");
export const signinCode = document.getElementById("sign-in-code");
// sign up
export const signupBtn = document.getElementById("sign-up-btn");
export const signupContent = document.getElementById("sign-up-content");
export const signupInput = document.getElementById("sign-up-input-list");
export const signupId = document.getElementById("sign-up-id");
export const signupPassword = document.getElementById("sign-up-password");
export const signupCheckPassword = document.getElementById("sign-up-check-password");
export const signupCheckPasswordLabel = document.getElementById("sign-up-check-password-label");
export const signupEmail = document.getElementById("sign-up-email");
export const signupEmailSubmit = document.getElementById("sign-up-email-btn");
export const signupEmailLabel = document.getElementById("sign-up-email-label");
export const signupEmailInfo = document.getElementById("email-info");
export const signupCodeLabel = document.getElementById("sign-up-code-label");
export const signupCode = document.getElementById("sign-up-code");
export const signupCodeInput = document.getElementById("sign-up-code-input");
export const signupCodeSubmit = document.getElementById("sign-up-code-btn");
export const signupSubmit = document.getElementById("sign-up-submit");
export const signupCancel = document.getElementById("sign-up-cancel");
// Oauth
export const oauthBtn = document.getElementById("sign-in-42-btn");
export const oauthInput = document.getElementById("42-sign-in-input");
export const oauthCode = document.getElementById("42-sign-in-code");
export const oauthSubmit = document.getElementById("42-sign-in-submit");

// content
export const windowContent = document.getElementById("window-content");
// log out
export const logoutBtn = document.getElementById("logout-btn");
// navi tabs
export const offlineTab = document.getElementById("offline-tab");
export const tournamentTab = document.getElementById("tournament-tab");
export const onlineTab = document.getElementById("online-tab");
// offline
export const offlineContent = document.getElementById("offline");
export const offlineInfo = document.getElementById("offline-info");
export const offlineInput1 = document.getElementById("name-input1");
export const offlineInput2 = document.getElementById("name-input2");
export const offlineInput1Label = document.getElementById("name-input1-label");
export const offlineInput2Label = document.getElementById("name-input2-label");
export const offlineSubmit = document.getElementById("offline-submit");
// tournament
export const tournamentContent = document.getElementById("tournament");
export const tournamentInfo = document.getElementById("tournament-info");
export const bracket = document.getElementById("bracket");
export const tournamentSelectNum = document.getElementById("select-num");
export const tournamentPeopleNum = document.getElementById("num-people");
export const index = document.getElementById("index-0");
export const tournamentInput = document.getElementById("input-list");
export const tournamentBtn = document.getElementById("tournament-btn");
export const tournamentSubmit = document.getElementById("tournament-submit")
// online
export const onlineContent = document.getElementById("online");
export const searchInput = document.getElementById("search-input");
export const searchOption = document.getElementById("search-option");
export const searchOptionRoom = document.getElementById("search-option-room");
export const searchOptionUser = document.getElementById("search-option-user");
export const searchBtn = document.getElementById("search-btn");
export const refreshBtn = document.getElementById("refresh-btn");
export const roomBtn = document.getElementById("make-room-btn");
export const roomSetting = document.getElementById("room-setting");
export const roomInfo = document.getElementById("online-info");
export const roomName = document.getElementById("online-room-name");
export const roomNameLabel = document.getElementById("online-room-name-label");
export const roomPassword = document.getElementById("online-password");
export const roomCancel = document.getElementById("online-room-cancel");
export const roomSubmit = document.getElementById("online-room-submit");
export const roomList = document.getElementById("room-list");
// room
export const room = document.getElementById("waiting-room");
export const hostName = document.getElementById("host-name");
export const hostStatus = document.getElementById("host-status");
export const guestName = document.getElementById("guest-name");
export const guestStatus = document.getElementById("guest-status");
export const readyBtn = document.getElementById("ready");
export const quitRoomBtn = document.getElementById("quit");

// footer
export const gamePoint = document.getElementById("show-game-point");
export const player1Score = document.getElementById("left-player");
export const player2Score = document.getElementById("right-player");
export const langSelect = document.getElementById("lang-select");

export const pageStatus = {
	0: "signin",
	1: "signup",
	2: "offline",
	3: "tournament",
	4: "online",
	5: "makeRoom",
	6: "inRoom",
	7: "ongame",
};

export function clearInput(container) {
	const inputList = container.querySelectorAll("input");
	for (let i = 0; i < inputList.length; i++) {
		if (inputList[i].type === "number") {
			inputList[i].value = 10;
		} else {
			inputList[i].value = "";
		}
	}
}

history.pushState(null, null, location.href);
window.onpopstate = function () {
	history.go(1);
};