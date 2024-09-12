import { lang, langIndex } from "./lang.js";
import { closeBracket } from "./content/feature.js";
import { exit } from "./object/game.js";
import { removeValue } from "./tab.js";

// signin page
const signin = document.getElementById("signin-content");
const signinId = document.getElementById("signin-id");
const signinPw = document.getElementById("signin-pw");
const signinBtn = document.getElementById("signin-btn");
const signupBtn = document.getElementById("signup-btn");

// signup page
const signup = document.getElementById("signup-content");
const signupId = document.getElementById("signup-id");
const signupPw = document.getElementById("signup-pw");
const signupCheckPw = document.getElementById("signup-check-pw");
// email
const signupEmail = document.getElementById("signup-email");
const signupEmailSubmit = document.getElementById("signup-email-btn");
const signupCodeLabel = document.getElementById("signup-code-label");
const signupCode = document.getElementById("signup-code");
const signupCodeInput = document.getElementById("signup-code-input");
const signupCodeSubmit = document.getElementById("signup-code-btn");
// other
const signupSubmit = document.getElementById("signup-clear");
const goBack = document.getElementById("go-back");

// containers
const signContainer = document.getElementById("sign");
const windowContainer = document.getElementById("window-content");
const logoutBtn = document.getElementById("logout-btn");
const offlineContainer = document.getElementById("offline");

const usernamePattern = /^\S+$/;
const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;

history.pushState(null, null, location.href);
window.onpopstate = function () {
	history.go(1);
};

// Sign in
signinBtn.addEventListener("click", () => {
	const idInput = signinId.value;
	const pwInput = signinPw.value;
	if (idInput.length === 0 || idInput === "") {
		alert(lang[langIndex].nullId);
	} else if (pwInput.length === 0 || pwInput === "") {
		alert(lang[langIndex].nullPw);
	} else {
		const body = {
			"username": idInput,
			"password": pwInput
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
				toContent();
			} else {
				alert(lang[langIndex].failSignin);
			}
		});
	}
});

// Sign up button
signupBtn.addEventListener("click", () => {
	signinId.value = "";
	signinPw.value = "";
	signin.style.display = "none";
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
goBack.addEventListener("click", () => {
	undo();
});

// Sign up - send to server
signupSubmit.addEventListener("click", () => {
	const idInput = signupId.value;
	const pwInput = signupPw.value;
	const checkPw = signupCheckPw.value;
	const emailInput = document.getElementById("signup-email").value;
	if (idInput.length === 0 || idInput === "") {
		alert(lang[langIndex].nullId);
	} else if (!usernamePattern.test(idInput)) {
		alert(lang[langIndex].wrongId);
	} else if (pwInput.length === 0 || pwInput === "") {
		alert(lang[langIndex].nullPw);
	} else if (!passwordPattern.test(pwInput)) {
		alert(lang[langIndex].wrongPw);
	} else if (checkPw != pwInput) {
		alert(lang[langIndex].notSame);
	} else {
		const body = {
			"username": idInput,
			"password": pwInput,
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
				undo();
			} else if (response.username) {
				alert(lang[langIndex].wrongId);
			} else if (response.password) {
				alert(lang[langIndex].wrongPw);
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
	sessionStorage.setItem("status", "signin");
}

export function toSignup() {
	signContainer.style.display = "block";
	windowContainer.style.display = "none";
	signin.style.display = "none";
	signup.style.display = "flex";
	sessionStorage.setItem("status", "signup");
}

export function undo() {
	signupId.value = "";
	signupPw.value = "";
	signupCheckPw.value = "";
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

document.getElementById("signin-42-btn").addEventListener("click", () => {
    window.location = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-444cfc0028fafb27c54d22afebcf9e3852a0d0f6060eb1a9d6280be8d5f2dcbf&redirect_uri=https%3A%2F%2Flocalhost%2Fuser%2Foauth%2F&response_type=code";
});
