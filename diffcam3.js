var video = document.getElementById('video');
var canvas = document.getElementById('motion');
var canvas2 = document.getElementById('motion2');
var canvas3 = document.getElementById('motion3');
var score = document.getElementById('score');
var score2 = document.getElementById('score2');
var score3 = document.getElementById('score3');
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


function capture3(payload3) {
	score3.textContent = payload3.score3;
}

DiffCamEngine.init({
	video: video,
	motionCanvas: canvas,
	motionCanvas2: canvas2,
    motionCanvas3: canvas3,
	initSuccessCallback: initSuccess,
	initErrorCallback: initError,
	captureCallback: capture,
	captureCallback2: capture2,
    captureCallback3: capture3

});
