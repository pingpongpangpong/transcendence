import { lang, langIndex } from "./lang.js";
import { closeBracket } from "./content/feature.js";
import { exit } from "./object/game.js";
import { removeValue } from "./tab.js";

// sign-in page
const signin = document.getElementById("sign-in-content");
const signinId = document.getElementById("sign-in-id");
const signinPassword = document.getElementById("sign-in-password");
const signinBtn = document.getElementById("sign-in-btn");
const signupBtn = document.getElementById("sign-up-btn");

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

// 2-factors
const signin2factor = document.getElementById("sign-in-2factor");
// email
const signin2factorEmail = document.getElementById("sign-in-2factor-email");
const signin2factorEmailBtn = document.getElementById("sign-in-2factor-email-btn");
// code
const signin2factorCodeLabel = document.getElementById("sign-in-2factor-code-label");
const signin2factorCodeInput = document.getElementById("sign-in-2factor-input");
const signin2factorCode = document.getElementById("sign-in-2factor-code");
const signin2factorCodeBtn = document.getElementById("sign-in-2factor-code-btn");
// button
const signin2factorCancel = document.getElementById("sign-in-2factor-cancel");
const signin2factorSubmit = document.getElementById("sign-in-2factor-submit");
// other

// containers
const signContainer = document.getElementById("sign");
const windowContainer = document.getElementById("window-content");
const logoutBtn = document.getElementById("logout-btn");
const offlineContainer = document.getElementById("offline");

const usernamePattern = /^\S+$/;
const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;

function removeSignin() {
	signinId.value = "";
	signinPassword.value = "";
	signin.style.display = "none";
}

history.pushState(null, null, location.href);
window.onpopstate = function () {
	history.go(1);
};

// Sign in
signinBtn.addEventListener("click", () => {
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
		const uri = "/user/login/";
		fetch(uri, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		}).then((response) => {
			if (response.status === 200) {
				to2factor();
			} else {
				alert(lang[langIndex].failsignin);
			}
		});
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

// 2 factor
signin2factorEmailBtn.addEventListener("click", () => {
	const email = signin2factorEmail.value;
	if (email.length === 0 || email === "") {
		alert(lang[langIndex].nullEmail);
	} else {
		const basicUri = "/user/login-2fa-email";
		const param = {
			email: email,
		};
		const query = new URLSearchParams(param).toString();
		const uri = `${basicUri}?${query}/`;
		fetch(uri).then((request) => {
			if (request.status === 200) {
				alert(lang[langIndex].sendCode);
				signin2factorCodeLabel.style.display = "block";
				signin2factorCodeInput.style.display = "block";
			} else {
				alert(lang[langIndex].failCode);
			}
		});
	}
});
// Verify email code
signin2factorCodeBtn.addEventListener("click", () => {
	const code = signin2factorCode.value;
	if (code.length === 0 || code === "") {
		alert(lang[langIndex].nullCode);
	} else {
		const basicUri = "/user/login-2fa";
		const param = {
			code: code,
		};
		const query = new URLSearchParams(param).toString();
		const uri = `${basicUri}?${query}/`;
		fetch(uri).then((request) => {
			if (request.status === 200) {
				toContent();
			} else {
				alert(lang[langIndex].failsignin);
			}
		})
	}
});
// undo
signin2factorCancel.addEventListener("click", () => {
	cancel2factor();
})
// sign in
signin2factorSubmit.addEventListener("click", () => {});

function cancel2factor() {
	signin2factorEmail.value = "";
	signin2factorCode.value = "";
	signin.style.display = "flex";
	signin2factor.style.display = "none";
	sessionStorage.setItem("status", "signin");
}

export function logout() {
	offlineContainer.style.display = "block";
	signContainer.style.display = "block";
	windowContainer.style.display = "none";
	logoutBtn.style.display = "none";
	signin.style.display = "flex";
	signin2factor.style.display = "none";
	sessionStorage.setItem("status", "signin");
}

export function toSignup() {
	signContainer.style.display = "block";
	windowContainer.style.display = "none";
	signin.style.display = "none";
	signup.style.display = "flex";
	signin2factor.style.display = "none";
	sessionStorage.setItem("status", "signup");
}

export function to2factor() {
	signContainer.style.display = "block";
	windowContainer.style.display = "none";
	signin.style.display = "none";
	signup.style.display = "none";
	signin2factor.style.display = "flex";
	sessionStorage.setItem("status", "2factor");
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
	signin2factor.style.display = "none";
	sessionStorage.setItem("status", "signin");
}

export function toContent() {
	signContainer.style.display = "none";
	windowContainer.style.display = "block";
	logoutBtn.style.display = "block";
	sessionStorage.setItem("status", "offline");
}
