import * as DOM from "../document.js";
import { Game, winner } from "../object/game.js";
import { lang, langIndex } from "../lang.js";
import { canvas, ctx, initBracket, paintBracket } from "./bracket.js";

let isRunning = true;

async function showBracket(players, round, second) {
	const time = second * 1000;
	paintBracket(players, round);
	await new Promise((resolve, reject) => setTimeout(() => {
		if (isRunning) {
			DOM.bracket.style.display = "none";
			resolve();
		} else {
			reject(new Error());
		}
		}, time));
}
export async function offline(gamePoint, name1, name2) {
	const game = new Game(gamePoint, "offline");
	game.awake(name1, name2);
	await game.update();
	DOM.offlineContent.style.display = "block";
}

export async function tournament(gamePoint, nameList) {
	let players = [];
	while (nameList.length > 0) {
		const randomNum = Math.floor(Math.random() * nameList.length);
		const player = nameList[randomNum];
		nameList.splice(randomNum, 1);
		players.push(player);
	}
	initBracket(players);
	isRunning = true;
	let round = 0;
	while (isRunning) {
		DOM.gamePoint.innerHTML = `${lang[langIndex].gamePoint}: ${gamePoint}`;
		try {
			if (!isRunning) {
				break;
			}
			if (players.length === 1) {
				await showBracket(players, round, 2);
				alert(`${players[0]} ${lang[langIndex].win}`);
				DOM.gamePoint.innerHTML = `${lang[langIndex].gamePoint}: `;
				DOM.tournamentContent.style.display = "block";
				return;
			}
			let winnerList = [];
			for (let i = 0; i < players.length; i += 2) {
				await showBracket(players, round, 5);
				const game = new Game(gamePoint, "tournament");
				game.awake(players[i], players[i + 1]);
				await game.update();
				winnerList.push(winner);
			}
			players = winnerList;
			round++;
		} catch (error) {
			break;
		}
	}
}

export function getGamePoint(type) {
	const gamePoint = document.getElementById(`${type}-game-point`).value;
	if (gamePoint < 2 || gamePoint > 20) {
		alert(lang[langIndex].alGP);
		return -1;
	}
	DOM.gamePoint.innerHTML = `${lang[langIndex].gamePoint}: ${gamePoint}`;
	return gamePoint;
}

export function checkName(name, index) {
	if (name === "") {
		alert(`${index}${lang[langIndex].alPNempty}`);
		return false;
	} else if (name.length < 4 || name.length > 20) {
		alert(`${index}${lang[langIndex].alPNlen}`);
		return false;
	}
	return true;
}

export function closeBracket() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	canvas.style.display = "none";
	isRunning = false;
	clearTimeout();
}