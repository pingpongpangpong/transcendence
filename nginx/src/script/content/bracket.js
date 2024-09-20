export const canvas = document.getElementById("bracket");
export const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;
const desiredWidth = 960;
const desiredHeight = 600;

canvas.width = desiredWidth * dpr;
canvas.height = desiredHeight * dpr;
canvas.style.width = `${desiredWidth}px`;
canvas.style.height = `${desiredHeight}px`;

ctx.scale(dpr, dpr);
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

ctx.lineWidth = 2;
ctx.strokeStyle = "#000000";

ctx.font = "20px DungGeunMo";
ctx.fillStyle = "#000000";
ctx.textBaseline = "middle";
ctx.textAlign = "center";

let round;
let height, width;
let margin, gap;
let startX, startY;

let marginList = [];
let startXlist = [];
let startYlist = [];

function drawLine(startX, startY, endX, endY) {
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
}

function painFront(length) {
	if (length === 1) {
		const x = startXlist[startXlist.length - 1];
		const y = startYlist[startYlist.length - 1];
		drawLine(x + width + gap / 2, y + height, x + width + gap, y + height);
		ctx.strokeRect(x + width + gap, y, width, height * 2);
		return ;
	}   
	let y = startY; 
	for (let i = 0; i < length / 2 - 1; i++) {
		ctx.strokeRect(startX, y, width, height);
		ctx.strokeRect(startX, y + height, width, height);
		if (i % 2 === 0) {
			drawLine(startX + width, y + height, startX + width + gap / 2, y + height);
			drawLine(startX + width + gap / 2, y + height, startX + width + gap / 2, y + 3 * height + margin);
			drawLine(startX + width + gap / 2, y + 2 * height + margin / 2, startX + width + gap, y + 2 * height + margin / 2);
		} else {
			drawLine(startX + width, y + height, startX + width + gap / 2, y + height);
		}
		y += 2 * height + margin;
	}
	ctx.strokeRect(startX, y, width, height);
	ctx.strokeRect(startX, y + height, width, height);
	drawLine(startX + width, y + height, startX + width + gap / 2, y + height);
	startXlist.push(startX);
	startYlist.push(startY);
	marginList.push(margin);
	startX += width + gap;
	startY += height + margin / 2;
	margin = 2 * height + 2 * margin;
	painFront(length / 2);
}

export function initBracket(nameList) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	marginList = [];
	startXlist = [];
	startYlist = [];
	const length = nameList.length
	round = Math.log2(length);
	height = 30;
	width = 150;
	margin = 100;
	gap = 150;
	if (length === 8) {
		margin = 50;
		gap = 80;
	} else if (length === 16) {
		margin = 10;
		gap = 40;
	}
	startX = (desiredWidth - (round * (width + gap) + width)) / 2;
	startY = (desiredHeight - (length * height + (length / 2 - 1) * margin)) / 2;
	painFront(length);
}

export function paintBracket(players, round) {
	if (players.length === 1) {
		const x = startXlist[startXlist.length - 1] + width + gap;
		const y = startYlist[startYlist.length - 1] + height;
		const player = (players[0].length >= 6 ? `${players[0].slice(0, 6)}.` : players[0]);
		ctx.fillText(player, x + width / 2, y);
	}
	else {
		const x = startXlist[round] + width / 2;
		let y = startYlist[round] + height / 2;
		for (let i = 0; i < players.length; i += 2) {
			const player1 = (players[i].length >= 6 ? `${players[i].slice(0, 6)}.` : players[i]);
			ctx.fillText(player1, x, y);
			const player2 = (players[i + 1].length >= 6 ? `${players[i + 1].slice(0, 6)}.` : players[i + 1]);
			ctx.fillText(player2, x, y + height);
			y += marginList[round] + 2 * height;
		}
	}
	canvas.style.display = "block";
}