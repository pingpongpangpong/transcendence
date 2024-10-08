import * as DOM from "./document.js";
import * as NET from "./network.js";
import { lang, langIndex } from "./lang.js";
import { closeBracket } from "./content/feature.js";
import { exit } from "./object/game.js";
import { onOffline, removeValue } from "./tab.js";

const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
const usernamePattern = /^\S+$/;
const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;

function sendCode(code) {
	if (code === "" || code.length === 0) {
		alert(lang[langIndex].nullCode);
		return;
	}
	const header = {
		"Content-Type": "application/json",
		"X-CSRFToken": NET.getCookie("csrftoken")
	};
	const body = {
		"code": code
	};
	const resFunc = function(res) {
		if (res.status === 200) {
			sessionStorage.removeItem("auth");
			DOM.signinInput.style.display = "grid";
			DOM.oauthInput.style.display = "none";
			window.history.replaceState({}, document.title, "/");
			toContent(onOffline);
		} else {
			alert(lang[langIndex].failsignin);
		}
	};
	NET.requestPost("/user/login/", header, body, resFunc, alert);
}

export function logout() {
	DOM.signContainer.style.display = "block";
	DOM.windowContent.style.display = "none";
	DOM.logoutBtn.style.display = "none";
	DOM.offlineContent.style.display = "block";
	DOM.signinContent.style.display = "flex";
	DOM.clearInput(DOM.windowContent);
	sessionStorage.setItem("status", "signin");
	sessionStorage.removeItem("game");
}

export function toSignup() {
	DOM.signContainer.style.display = "block";
	DOM.windowContent.style.display = "none";
	DOM.signinContent.style.display = "none";
	DOM.signupContent.style.display = "flex";
	DOM.clearInput(DOM.signinInput);
	sessionStorage.setItem("status", "signup");
	sessionStorage.removeItem("game");
}

export function cancelSignup() {
	DOM.signupCode.style.display = "none";
	DOM.signupCodeSubmit.style.display = "none";
	DOM.signupSubmit.style.display = "none";
	DOM.signContainer.style.display = "block";
	DOM.signinContent.style.display = "flex";
	DOM.signupContent.style.display = "none";
	DOM.signupCodeLabel.style.display = "none";
	DOM.clearInput(DOM.signupInput);
	sessionStorage.setItem("status", "signin");
	sessionStorage.removeItem("game");
}

export function toContent(where) {
	DOM.signContainer.style.display = "none";
	DOM.windowContent.style.display = "block";
	DOM.logoutBtn.style.display = "block";
	DOM.clearInput(DOM.signContainer);
	sessionStorage.setItem("status", "offline");
	sessionStorage.removeItem("game");
	where();
}

// Sign in
DOM.signinBtn.addEventListener("click", () => {
	DOM.signinInput.style.display = "grid";
	DOM.oauthInput.style.display = "none";
	DOM.clearInput(DOM.oauthInput);
});

// check id and passsword when sign in
DOM.signin2factor.addEventListener("click", () => {
	const idInput = DOM.signinId.value;
	const passwordInput = DOM.signinPassword.value;
	if (idInput.length === 0 || idInput === "") {
		alert(lang[langIndex].nullId);
	} else if (koreanRegex.test(idInput)) {
		alert(lang[langIndex].wrongId);
	} else if (passwordInput.length === 0 || passwordInput === "") {
		alert(lang[langIndex].nullPassword);
	} else {
		const body = {
			"username": idInput,
			"password": passwordInput
		};
		const resFunc = function (res) {
			if (res.status === 200) {
				alert(lang[langIndex].sendCode);
			} else {
				alert(lang[langIndex].failCode);
			}
		}
		NET.requestPost("/user/pre-login/", NET.header, body, resFunc, alert);
	}
});

// Sign in button
DOM.signinSubmitBtn.addEventListener("click", () => {
	const idInput = DOM.signinId.value;
	const passwordInput = DOM.signinPassword.value;
	const code = DOM.signinCode.value;
	if (idInput.length === 0 || idInput === "") {
		alert(lang[langIndex].nullId);
	} else if (koreanRegex.test(idInput)) {
		alert(lang[langIndex].wrongId);
	} else if (passwordInput.length === 0 || passwordInput === "") {
		alert(lang[langIndex].nullPassword);
	} else {
		sendCode(code);
	}
});

// Sign up
DOM.signupBtn.addEventListener("click", () => {
	DOM.clearInput(DOM.signinInput);
	DOM.signinContent.style.display = "none";
	DOM.signupContent.style.display = "flex";
	sessionStorage.setItem("status", "signup");
});

// Verify email
DOM.signupEmailSubmit.addEventListener("click", () => {
	const email = DOM.signupEmail.value;
	if (email.length === 0 || email === "") {
		alert(lang[langIndex].nullEmail);
	} else {
		const body = {
			"email": email
		};
		const resFunc = function (res) {
			if (res.status === 200) {
				alert(lang[langIndex].sendCode);
				DOM.signupCode.style.display = "flex";
				DOM.signupCodeLabel.style.display = "block";
				DOM.signupCodeSubmit.style.display = "block";
			} else {
				alert(lang[langIndex].failCode);
			}
		}
		NET.requestPost("/user/email/", NET.header, body, resFunc, alert);
	}
});

// Verify email code
DOM.signupCodeSubmit.addEventListener("click", () => {
	const code = DOM.signupCodeInput.value;
	if (code.length === 0 || code === "") {
		alert(lang[langIndex].nullCode);
	} else {
		const body = {
			"email": DOM.signupEmail.value,
			"code": code
		};
		const resFunc = function (res) {
			if (res.status === 200) {
				alert(lang[langIndex].successVerify);
				DOM.signupSubmit.style.display = "block";
			} else {
				alert(lang[langIndex].failVerify);
			}
		};
		NET.requestPost("/user/email-check/", NET.header, body, resFunc, alert);
	}
});

// undo
DOM.signupCancel.addEventListener("click", () => {
	cancelSignup();
});

// send id, password and email when sign up
DOM.signupSubmit.addEventListener("click", () => {
	const idInput = DOM.signupId.value;
	const passwordInput = DOM.signupPassword.value;
	const checkPassword = DOM.signupCheckPassword.value;
	const emailInput = document.getElementById("sign-up-email").value;
	if (idInput.length === 0 || idInput === "") {
		alert(lang[langIndex].nullId);
	} else if (koreanRegex.test(idInput)) {
		alert(lang[langIndex].wrongId);
	} else if (!usernamePattern.test(idInput)) {
		alert(lang[langIndex].wrongId);
	} else if (passwordInput.length === 0 || passwordInput === "") {
		alert(lang[langIndex].nullPassword);
	} else if (!passwordPattern.test(passwordInput)) {
		alert(lang[langIndex].wrongPassword);
	} else if (checkPassword !== passwordInput) {
		alert(lang[langIndex].notSame);
	} else {
		const body = {
			"username": idInput,
			"password": passwordInput,
			"email": emailInput
		};
		const resFunc = function (res) {
			if (res.status === 201) {
				cancelSignup();
			} else {
				throw res;
			}
		}
		const errFunc = function (error) {
			if (error.username) {
				alert(lang[langIndex].wrongId);
			} else if (error.password) {
				alert(lang[langIndex].wrongPassword);
			} else if (error.email) {
				alert(lang[langIndex].wrongEmail);
			}
		}
		NET.requestPost("/user/signup/", NET.header, body, resFunc, errFunc);
	}
});

// Log out
DOM.logoutBtn.addEventListener("click", () => {
	const resFunc = function (res) {
		if (res.status === 205) {
			removeValue();
			exit();
			closeBracket();
			logout();
			return null;
		}
		throw lang[langIndex].invalidToken
	}
	NET.requestGet("/user/logout/", resFunc, alert);
});

// 42 oauth
DOM.oauthBtn.addEventListener("click", () => {
	sessionStorage.setItem("auth", "request");
});

DOM.oauthSubmit.addEventListener("click", () => {
	const code = DOM.oauthCode.value;
	sendCode(code);
});