var video = document.getElementById('video');
var canvas = document.getElementById('motion');
var score = document.getElementById('score');
var score2 = document.getElementById('score2');
var xValue = document.getElementById('xValue');
var yValue = document.getElementById('yValue');


function initSuccess() {
	DiffCamEngine.start();

	
}

function initError() {
	alert('Something went wrong.');
}

function capture(payload) {
	score.textContent = payload.score;
}

function capture2(payload2) {
	score2.textContent = payload2.score2;
}


DiffCamEngine.init({
	video: video,
	motionCanvas: canvas,
	initSuccessCallback: initSuccess,
	initErrorCallback: initError,
	captureCallback: capture,
	captureCallback2: capture2

});
