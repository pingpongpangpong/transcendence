import { tournament, getGamePoint, checkName } from "./feature.js";
import { lang, langIndex } from "../lang.js";
import { checkUser } from "../tab.js";

document.getElementById("select-num").addEventListener("change",  (e) => {
	const inputList = document.getElementById("input-list");
	while (inputList.firstChild) {
		inputList.removeChild(inputList.firstChild);
	}

	if (e.value === 0) {
		return;
	}

	for (let i = 0; i < e.target.value; i++) {
		const container = document.createElement("div");
		container.id = `player-${i + 1}`;
		container.className = "field-row-stacked";

		const label = document.createElement("label");
		label.for = `player-${i + 1}-input`;
		label.className = "player";
		label.textContent = `${i + 1}${lang[langIndex].playerName}`;

		const input = document.createElement("input");
		input.id = `player-${i + 1}-input`;
		input.type = "text";
		input.style.width
		input.required = true;

		container.appendChild(label);
		container.appendChild(input);
		inputList.appendChild(container);
	}

	const buttonSection = document.getElementById("tournament-btn");
	while (buttonSection.firstChild) {
		buttonSection.removeChild(buttonSection.firstChild);
	}

	const startButton = document.createElement("button");
	startButton.id = "tournament-submit";
	startButton.innerText = lang[langIndex].submit;
	buttonSection.appendChild(startButton);

	startButton.addEventListener("click", () => {
		checkUser();
		const gamePoint = getGamePoint("tournament");
		if (gamePoint < 0) {
			return;
		}

		const len = inputList.childNodes.length;
		const list = inputList.childNodes;
		let nameList = [];
		for (let i = 0; i < len; i++) {
			nameList[i] = list[i].childNodes[1].value;
		}
		for (let i = 0; i < len; i++) {
			if (!checkName(nameList[i], i + 1)) {
				return;
			}
		}
		for (let i = 0; i < len - 1; i++) {
			for (let j = i + 1; j < len; j++) {
				if (nameList[i] === nameList[j]) {
					alert(`${i + 1}${lang[langIndex].alPNsame1}${j + 1}${lang[langIndex].alPNsame2}`);
					return;
				}
			}
		}

		document.getElementById("tournament").style.display = "none";
		sessionStorage.setItem("game", "tournament");
		tournament(gamePoint, nameList);
	});
});