var video = document.getElementById('video');
var canvas = document.getElementById('motion');
var canvas2 = document.getElementById('motion2');
var score = document.getElementById('score');
var score2 = document.getElementById('score2');
var xValue = document.getElementById('xValue');
var yValue = document.getElementById('yValue');

// kode fra sequencer


const synths = [
    new Tone.Sampler({
      "C1" : "samples/001.wav"
  }),
  new Tone.Sampler({
      "C2" : "samples/003.wav"
  }),
    
  ];
  

  
  synths.forEach(synth => synth.connect(gainNode));
  
  //const $rows = document.body.querySelectorAll('div > div'),
  notes = ['C2', 'E4'];
  
  
  let noteOn = score2; 
  let noteOn2 = score2 - 1;
  let noteOn3 = score2 - 2;
  let noteOn4 = score2 - 3;
    
  let index = 0;
  
  Tone.Transport.scheduleRepeat(repeat, '2n');
  Tone.Transport.start();
  
  function repeat(time) {
    let step = index % 2;
    for (let i = 0; i < 2; i++) {
      //let synth = synths[i];
          //note = notes[i],
          //$row = $rows[i],
          //$input = $row.querySelector(`input:nth-child(${step + 1})`);
          //console.log($input.checked);
          console.log(score2);


      //if ($input.checked) synth.triggerAttackRelease(note, '8n', time);
      if (noteOn == step) synths[1].triggerAttackRelease(notes[0], '8n', time);
      if (noteOn2 == step) synths[0].triggerAttackRelease(notes[0], '8n', time + 1);
      //console.log(noteOn == step);
      break;
      //if (noteOn4) synths[0].disconnect();
 
    }
    index++;
  }

// kode fra sequencer


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
	motionCanvas2: canvas2,
	initSuccessCallback: initSuccess,
	initErrorCallback: initError,
	captureCallback: capture,
	captureCallback2: capture2

});
