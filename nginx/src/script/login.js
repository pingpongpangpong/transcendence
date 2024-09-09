import { lang, langIndex } from "./lang.js";

const signin = document.getElementById("signin-content");
const signup = document.getElementById("signup-content");

const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;

history.pushState(null, null, location.href);
window.onpopstate = function () {
	history.go(1);
};

document.getElementById("sign-in-btn").addEventListener("click", () => {
	const idInput = document.getElementById("id-input").value;
	const pwInput = document.getElementById("pw-input").value;
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
				document.getElementById("sign").style.display = "none";
				document.getElementById("window-content").style.display = "block";
			} else {
				alert(lang[langIndex].failSingin);
			}
		});
	}
});

document.getElementById("sign-up-btn").addEventListener("click", () => {
	document.getElementById("id-input").value = "";
	document.getElementById("pw-input").value = "";
	signin.style.display = "none";
	signup.style.display = "flex";
});

document.getElementById("email-auth-btn").addEventListener("click", () => {
	const email = document.getElementById("email-signup").value;
	if (email.length === 0 || email === "") {
		alert(lang[langIndex].nullEmail);
	} else {
		const body = {
			"email": document.getElementById("")
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
				document.getElementById("email-signup-auth-label").style.display = "block";
				document.getElementById("email-check").style.display = "block";
			} else {
				alert(lang[langIndex].failCode);
			}
		});
	}
});

document.getElementById("email-signup-auth-check").addEventListener("click", () => {
	const code = document.getElementById("email-signup-auth").value;
	if (code.length === 0 || code === "") {
		alert(lang[langIndex].nullCode);
	} else {
		const baseUri = "/user/email-check/";
		const param = {
			code: code,
		};
		const queryString = new URLSearchParams(param).toString();
		const uri = `${baseUri}?${queryString}/`;
		try {
			fetch(uri).then((response) => {
				if (response.status === 200) {
					alert(lang[langIndex].successVerify);
				} else {
					alert(lang[langIndex].failVerify);
				}
			});
		} catch (error) {
			console.log(error);
		}
		document.getElementById("signup-clear").style.display = "block";
	}
});

document.getElementById("go-back").addEventListener("click", () => {
	document.getElementById("id-signup").value = "";
	document.getElementById("pw-signup").value = "";
	document.getElementById("check-pw").value = "";
	document.getElementById("email-signup").value = "";
	document.getElementById("email-signup-auth").value = "";
	document.getElementById("email-signup-auth-label").style.display = "none";
	document.getElementById("email-check").style.display = "none";
	document.getElementById("signup-clear").style.display = "none";
	signin.style.display = "flex";
	signup.style.display = "none";
});

document.getElementById("signup-clear").addEventListener("click", () => {
	const idInput = document.getElementById("id-signup").value;
	const pwInput = document.getElementById("pw-signup").value;
	const pwCheck = document.getElementById("check-pw").value;
	const emailInput = document.getElementById("email-signup").value;
	if (idInput.length === 0 || idInput === "") {
		alert(lang[langIndex].nullId);
	} else if (pwInput.length === 0 || pwInput === "") {
		alert(lang[langIndex].nullPw);
	} else if (!passwordPattern.test(pwInput)) {
		alert(lang[langIndex].wrongPw);
	} else if (pwCheck != pwInput) {
		alert(lang[langIndex].notSame);
	} else {
		const body = {
			"username": idInput,
			"password": pwInput,
			"email": email
		};
		const uri = "/user/signup/";
		fetch(uri, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		}).then((response) => {
			if (response.status === 200) {
				signin.style.display = "flex";
				signin.style.display = "none";
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