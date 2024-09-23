import { lang, langIndex } from "./lang.js";
import { closeBracket } from "./content/feature.js";
import { exit } from "./object/game.js";
import { removeValue } from "./tab.js";

// sign-in page
const signin = document.getElementById("sign-in-content");
const signinId = document.getElementById("sign-in-id");
const signinPassword = document.getElementById("sign-in-password");
const signinBtn = document.getElementById("sign-in-submit");
const signupBtn = document.getElementById("sign-up-btn");
// 2-factors
const signin2factor = document.getElementById("sign-in-2factor");
const signinCodeLabel = document.getElementById("sign-in-code-label");
const signinCode = document.getElementById("sign-in-code");

// signup page
const signup = document.getElementById("sign-up-content");
const signupId = document.getElementById("sign-up-id");
const signupPassword = document.getElementById("sign-up-password");
const signupCheckPassword = document.getElementById("sign-up-check-password");
// email
const signupEmail = document.getElementById("sign-up-email");
const signupEmailSubmit = document.getElementById("sign-up-email-btn");
const signupCodeLabel = document.getElementById("sign-up-code-label");
const signupCode = document.getElementById("sign-up-code");
const signupCodeInput = document.getElementById("sign-up-code-input");
const signupCodeSubmit = document.getElementById("sign-up-code-btn");
// other
const signupSubmit = document.getElementById("sign-up-submit");
const signupCancel = document.getElementById("sign-up-cancel");

// containers
const signContainer = document.getElementById("sign");
const windowContainer = document.getElementById("window-content");
const logoutBtn = document.getElementById("logout-btn");
const offlineContainer = document.getElementById("offline");
const signinContainer = document.getElementById("sign-in-input");
const signin42Container = document.getElementById("42-sign-in-input");

const usernamePattern = /^\S+$/;
const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;

function getCookie(name) {
    let value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null;
}

function removeSignin() {
	signinId.value = "";
	signinPassword.value = "";
	signin.style.display = "none";
}

function sendCode(code) {
	if (code === "" || code.length === 0) {
		alert(lang[langIndex].nullCode);
		return;
	}
	const body = {
		"code": code
	};
	fetch("/user/login/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": getCookie('csrftoken')
		},
		body: JSON.stringify(body),
	}).then((response) => {
		if (response.status === 200) {
			sessionStorage.clear();
			toContent();
		} else {
			alert(lang[langIndex].failsignin);
		}
	});
}

function isSuccessOauth() {
	const signinStatus = sessionStorage.getItem("auth");
	if (signinStatus === null) {
		signinContainer.style.display = "block";
		signin42Container.style.display = "none";
		return;
	}
	const params = new URLSearchParams(window.location.search);
	const authStatus = params.get("Oauth");
	if (authStatus === "Success") {
		signinContainer.style.display = "none";
		signin42Container.style.display = "block";
	} else {
		signinContainer.style.display = "block";
		signin42Container.style.display = "none";
	}
}

history.pushState(null, null, location.href);
window.onpopstate = function () {
	history.go(1);
};


// Sign in
document.getElementById("sign-in-btn").addEventListener("click", () => {
	signinContainer.style.display = "block";
	signin42Container.style.display = "none";
});

signin2factor.addEventListener("click", () => {
	const idInput = signinId.value;
	const passwordInput = signinPassword.value;
	if (idInput.length === 0 || idInput === "") {
		alert(lang[langIndex].nullId);
	} else if (passwordInput.length === 0 || passwordInput === "") {
		alert(lang[langIndex].nullPassword);
	} else {
		const body = {
			"username": idInput,
			"password": passwordInput
		};
		const uri = "/user/pre-login/";
		fetch(uri, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		}).then((request) => {
			if (request.status === 200) {
				alert(lang[langIndex].sendCode);
				signinCodeLabel.style.display = "block";
				signinCode.style.display = "block";
				signinBtn.style.display = "block";
			} else {
				alert(lang[langIndex].failCode);
			}
		});
	}
});
// Sign in button
signinBtn.addEventListener("click", () => {
	const idInput = signinId.value;
	const passwordInput = signinPassword.value;
	const code = signinCode.value;
	if (idInput.length === 0 || idInput === "") {
		alert(lang[langIndex].nullId);
	} else if (passwordInput.length === 0 || passwordInput === "") {
		alert(lang[langIndex].nullPassword);
	} else {
		sendCode(code);
	}
});

// Sign up
signupBtn.addEventListener("click", () => {
	removeSignin();
	signup.style.display = "flex";
	sessionStorage.setItem("status", "signup");
});
// Verify email
signupEmailSubmit.addEventListener("click", () => {
	const email = signupEmail.value;
	if (email.length === 0 || email === "") {
		alert(lang[langIndex].nullEmail);
	} else {
		const body = {
			"email": email
		};
		const uri = "/user/email/";
		fetch(uri, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		}).then((response) => {
			if (response.status === 200) {
				alert(lang[langIndex].sendCode);
				signupCode.style.display = "flex";
				signupCodeLabel.style.display = "block";
				signupCodeSubmit.style.display = "block";
			} else {
				alert(lang[langIndex].failCode);
			}
		});
	}
});
// Verify email code
signupCodeSubmit.addEventListener("click", () => {
	const code = signupCodeInput.value;
	if (code.length === 0 || code === "") {
		alert(lang[langIndex].nullCode);
	} else {
		const uri = "/user/email-check/";
		const body = {
			"email": signupEmail.value,
			"code": code
		};
		try {
			fetch(uri, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			}).then((response) => {
				if (response.status === 200) {
					alert(lang[langIndex].successVerify);
				} else {
					alert(lang[langIndex].failVerify);
				}
			});
		} catch (error) {
			console.log(error);
		}
		signupSubmit.style.display = "block";
	}
});
// undo
signupCancel.addEventListener("click", () => {
	cancelSignup();
});
// send to server
signupSubmit.addEventListener("click", () => {
	const idInput = signupId.value;
	const passwordInput = signupPassword.value;
	const checkPassword = signupCheckPassword.value;
	const emailInput = document.getElementById("sign-up-email").value;
	if (idInput.length === 0 || idInput === "") {
		alert(lang[langIndex].nullId);
	} else if (!usernamePattern.test(idInput)) {
		alert(lang[langIndex].wrongId);
	} else if (passwordInput.length === 0 || passwordInput === "") {
		alert(lang[langIndex].nullPassword);
	} else if (!passwordPattern.test(passwordInput)) {
		alert(lang[langIndex].wrongPassword);
	} else if (checkPassword != passwordInput) {
		alert(lang[langIndex].notSame);
	} else {
		const body = {
			"username": idInput,
			"password": passwordInput,
			"email": emailInput
		};
		const uri = "/user/signup/";
		fetch(uri, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		}).then((response) => {
			if (response.status === 201) {
				cancelSignup();
			} else if (response.username) {
				alert(lang[langIndex].wrongId);
			} else if (response.password) {
				alert(lang[langIndex].wrongPassword);
			} else if (response.email) {
				alert(lang[langIndex].wrongEmail);
			}
		});
	}
});

// Log out
logoutBtn.addEventListener("click", () => {
	fetch("/user/logout/").then((response) => {
		if (response.status === 205) {
			removeValue();
			exit();
			closeBracket();
			logout();
		} else {
			alert(lang[langIndex].invalidToken);
		}
	});
});

export function logout() {
	offlineContainer.style.display = "block";
	signContainer.style.display = "block";
	windowContainer.style.display = "none";
	logoutBtn.style.display = "none";
	signin.style.display = "flex";
	signinCodeLabel.style.display = "none";
	signinCode.style.display = "none";
	signinBtn.style.display = "none";
	sessionStorage.setItem("status", "signin");
}

export function toSignup() {
	signContainer.style.display = "block";
	windowContainer.style.display = "none";
	signin.style.display = "none";
	signup.style.display = "flex";
	sessionStorage.setItem("status", "signup");
}

export function cancelSignup() {
	signupId.value = "";
	signupPassword.value = "";
	signupCheckPassword.value = "";
	signupEmail.value = "";
	signupCodeInput.value = "";
	signupCode.style.display = "none";
	signupCodeSubmit.style.display = "none";
	signupSubmit.style.display = "none";
	signContainer.style.display = "block";
	signin.style.display = "flex";

	signup.style.display = "none";
	sessionStorage.setItem("status", "signin");
}

export function toContent() {
	signContainer.style.display = "none";
	windowContainer.style.display = "block";
	logoutBtn.style.display = "block";
	sessionStorage.setItem("status", "offline");
}

// 42 oauth
document.getElementById("sign-in-42-btn").addEventListener("click", () => {
	sessionStorage.setItem("auth", "request");
});

document.getElementById("42-sign-in-submit").addEventListener("click", () => {
	const code = document.getElementById("42-sign-in-code").value;
	sendCode(code);
});

window.onload = isSuccessOauth();