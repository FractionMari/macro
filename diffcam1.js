var video = document.getElementById('video');
var canvas = document.getElementById('motion');
var score = document.getElementById('score');
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

DiffCamEngine.init({
	video: video,
	motionCanvas: canvas,
	initSuccessCallback: initSuccess,
	initErrorCallback: initError,
	captureCallback: capture
});
