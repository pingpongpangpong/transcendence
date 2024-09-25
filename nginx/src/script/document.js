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
export const signupEmail = document.getElementById("sign-up-email");
export const signupEmailSubmit = document.getElementById("sign-up-email-btn");
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

export const offlineTab = document.getElementById("offline-tab");
export const tournamentTab = document.getElementById("tournament-tab");
export const onlineTab = document.getElementById("online-tab");

export const offlineContent = document.getElementById("offline");
export const tournamentContent = document.getElementById("tournament");
export const onlineContent = document.getElementById("online");

export const selectNum = document.getElementById("select-num");
export const tournamentInputs = document.getElementById("input-list");
export const tournamentBtn = document.getElementById("tournament-btn");

export const roomSetting = document.getElementById("room-setting");

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

export function clearInput(container) {
	const inputList = container.querySelectorAll("input");
	for (let i = 0; i < inputList.length; i++) {
		inputList[i].value = "";
	}
}