// This code is based on examples from the Diff Cam Engine:
// https://github.com/lonekorean/diff-cam-engine
// Licence:

/* Copyright (c) 2016 Will Boyd

This software is released under the MIT license: http://opensource.org/licenses/MIT

Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the "Software"), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, merge, 
publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or 
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

//  14. april 2021 prøver jeg å dele opp skjermen enda mer

// 

var DiffCamEngine = (function() {

    // GLOBAL variables
	var stream;					// stream obtained from webcam
	var video;					// shows stream
	var captureCanvas;			// internal canvas for capturing full images from video
	var captureContext;			// context for capture canvas
    var initSuccessCallback;	// called when init succeeds
	var initErrorCallback;		// called when init fails
	var startCompleteCallback;	// called when start is complete
    var captureInterval;		// interval for continuous captures
	var captureIntervalTime;	// time between captures, in ms
	var captureWidth;			// full captured image width
	var captureHeight;			// full captured image height  
	var isReadyToDiff;			// has a previous capture been made to diff against?
	var pixelDiffThreshold;		// min for a pixel to be considered significant
	var scoreThreshold;			// min for an image to be considered significant

    // CANVAS 1 VARIABLES:
	var diffCanvas;				// internal canvas for diffing downscaled captures
	var diffContext;			// context for diff 
    var motionCanvas;			// receives processed diff images
    var motionContext;			// context for motion canvas
    var captureCallback;		// called when an image has been captured and diffed
    var diffWidth;				// downscaled width for diff/motion
    var diffHeight;				// downscaled height for diff/motion
    var includeMotionBox;		// flag to calculate and draw motion bounding box
	var includeMotionPixels;	// flag to create object denoting pixels with motion

    // CANVAS 2 VARIABLES:
	var diffCanvas2;			// internal canvas for diffing downscaled captures BEHOLD
	var diffContext2;			// context for diff canvas. BEHOLD
    var motionCanvas2;			// receives processed diff images for the second canvas
    var motionContext2;			// context for motion canvas
	var captureCallback2;		// called when an image has been captured and diffed BEHOLD for å monitore values til HTML
    var diffWidth2;				// downscaled width for diff/motion
    var diffHeight2;			// downscaled height for diff/motion for a second canvas
    var includeMotionBox2;		// flag to calculate and draw motion bounding box
	var includeMotionPixels2;	// flag to create object denoting pixels with motion

	
///////// CANVAS AND WEBCAM OPTIONS /////////////
function init(options) {
        // sanity check
        if (!options) {
            throw 'No options object provided';
        }

        // GLOBAL SETTINGS
        video = options.video || document.createElement('video');
        captureIntervalTime = options.captureIntervalTime || 10;
        captureWidth = options.captureWidth || 900;
        captureHeight = options.captureHeight || 500;
        pixelDiffThreshold = options.pixelDiffThreshold || 32;
        scoreThreshold = options.scoreThreshold || 16;
        initSuccessCallback = options.initSuccessCallback || function() {};
        initErrorCallback = options.initErrorCallback || function() {};
        startCompleteCallback = options.startCompleteCallback || function() {};
        captureCanvas = document.createElement('canvas');
        isReadyToDiff = false;
        video.autoplay = true;
        captureCanvas.width  = captureWidth;
        captureCanvas.height = captureHeight;
        captureContext = captureCanvas.getContext('2d');


        // CANVAS 1 SETTINGS
        motionCanvas = options.motionCanvas || document.createElement('canvas');
        diffWidth = options.diffWidth || 4;
        diffHeight = options.diffHeight || 32;
        includeMotionBox = options.includeMotionBox || false;
        includeMotionPixels = options.includeMotionPixels || false;
        captureCallback = options.captureCallback || function() {};
        diffCanvas = document.createElement('canvas');
        // prep diff canvas
        diffCanvas.width = 1;
        diffCanvas.height = diffHeight;
        diffContext = diffCanvas.getContext('2d');
        // prep motion canvas
        motionCanvas.width = diffWidth;
        motionCanvas.height = diffHeight;
        motionContext = motionCanvas.getContext('2d');


        // CANVAS 2 SETTINGS
        motionCanvas2 = options.motionCanvas2 || document.createElement('canvas2');
        diffWidth2 = options.diffWidth2 || 4;
        diffHeight2 = options.diffHeight2 || 2;
        includeMotionBox2 = options.includeMotionBox2 || false;
        includeMotionPixels2 = options.includeMotionPixels2 || false;
        captureCallback2 = options.captureCallback2 || function() {};
        diffCanvas2 = document.createElement('canvas');
        // prep second diff canvas
        diffCanvas2.width = diffWidth2;
        diffCanvas2.height = diffHeight2;
        diffContext2 = diffCanvas2.getContext('2d');
        // prep second motion canvas
        motionCanvas2.width = diffWidth2;
        motionCanvas2.height = diffHeight2;
        motionContext2 = motionCanvas2.getContext('2d');

        // If making new canvases, remember to update "diffcam.js"

        requestWebcam();
    }

function capture() {
    // GLOBAL save a full-sized copy of capture 
    captureContext.drawImage(video, 0, 0, captureWidth, 1);
    isReadyToDiff = true;


    // CANVAS 1:
    // behold  Koden her inne er esssensiell for oppdeling av vinduet
    // diffContext lager nye fraksjoner av canvas. difference og source-over må være likt.
    var captureImageData = captureContext.getImageData(0, 0, captureWidth, 1);
    diffContext.globalCompositeOperation = 'difference';
    diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);
    // denne forskjellen er viktig. diffContext2 er essensiell. (x, x, vidden til bildet, høyden til bildet)
    var diffImageData = diffContext.getImageData(0, 0, 1, diffHeight);
    //*** behold */
    // draw current capture normally over diff, ready for next time
    diffContext.globalCompositeOperation = 'source-over';
    diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);

    // CANVAS 2:
    var captureImageData2 = captureContext.getImageData(1, 1, captureWidth, 1);
    diffContext2.globalCompositeOperation = 'difference'; 
    diffContext2.drawImage(video, 0, 0, diffWidth2, diffHeight2);   
    // denne forskjellen er viktig. diffContext2 er essensiell.

    // The values inside the following line must be the same as in:  
    // motionContext2.putImageData(diffImageData2, 1, 0);
    // Those values will give only one line of pixels on the canvas: var diffImageData2 = diffContext2.getImageData(1, 1, diffWidth2, diffHeight2); // BEHOLD
        
    var diffImageData2 = diffContext2.getImageData(1, 0, diffWidth2, diffHeight2); // BEHOLD
    //*** behold */
    diffContext2.globalCompositeOperation = 'source-over';
    diffContext2.drawImage(video, 0, 0, diffWidth2, diffHeight2);

    if (isReadyToDiff) {     
        // Canvas 1 (Filter):
        // this is where you place the grid on the canvas (men det blir feil i forhold til bevegelsen)
        // for å forklare hvor griden blir satt: det første tallet er y-aksen
        // og de andre tallet er x-aksen. Husk at bildet er speilvendt, 
        // så du teller fra venstre og bort.
        // Husk også at du starter på 0, så 5 blir nederste på y-aksen. Og 0 er borteste på y-aksen.
        var diff = processDiff(diffImageData);
        motionContext.putImageData(diffImageData, 0, 0);
        if (diff.motionBox) {
            motionContext.strokeStyle = '#fff';
            motionContext.strokeRect(
                diff.motionBox.x.min + 0.5,
                diff.motionBox.y.min + 0.5,
                diff.motionBox.x.max - diff.motionBox.x.min,
                diff.motionBox.y.max - diff.motionBox.y.min
            );
        }
        captureCallback({
            imageData: captureImageData,
            score: diff.score,
            hasMotion: diff.score >= scoreThreshold,
            motionBox: diff.motionBox,
            motionPixels: diff.motionPixels,
            getURL: function() {
                return getCaptureUrl(this.imageData);
            },
            checkMotionPixel: function(x, y) {
                return checkMotionPixel(this.motionPixels, x, y)
            }
                        
        });

        // Canvas 2 (Oscillator):
        var diff2 = processDiff2(diffImageData2);
        // this is where you place the grid on the canvas

        // The values inside the following line must be the same as in:  
        // var diffImageData2 = diffContext2.getImageData(1, 0, diffWidth2, diffHeight2); // BEHOLD.
        // Those values will give only one line of pixels on the canvas:   motionContext2.putImageData(diffImageData2, 1, 1);
        motionContext2.putImageData(diffImageData2, 1, 0);
        if (diff2.motionBox) {
            motionContext2.strokeStyle = '#fff';
            motionContext2.strokeRect(
                diff2.motionBox.x.min + 0.5,
                diff2.motionBox.y.min + 0.5,
                diff2.motionBox.x.max - diff2.motionBox.x.min,
                diff2.motionBox.y.max - diff2.motionBox.y.min
            );
        }
        captureCallback2({
            imageData2: captureImageData2,
            // score2 her for å gi monitoring i HTMLen (husk også å legge til i diffcam1.js )
            score2: diff2.score,
            hasMotion2: diff2.score >= 2,
            motionBox: diff2.motionBox,
            motionPixels: diff2.motionPixels,
        getURL: function() {
            return getCaptureUrl(this.imageData2);
        },
        checkMotionPixel: function(x, y) {
            return checkMotionPixel(this.motionPixels, x, y)
        }      	            
        });
    }
    }

// CANVAS 1 PROCESSING DIFF
// The first one is the Y axis, currently controling a Filter
	function processDiff(diffImageData) {
		
		var rgba = diffImageData.data;
		// pixel adjustments are done by reference directly on diffImageData
		var score = 0;
		var motionPixels = includeMotionPixels ? [] : undefined;
        var motionBox = undefined;
      
		for (var i = 0; i < rgba.length; i += 4) {
			var pixelDiff = rgba[i] * 0.9 + rgba[i + 1] * 0.3 + rgba[i + 2] * 0.3;
			var normalized = Math.min(255, pixelDiff * (50 / pixelDiffThreshold));         
/* 			rgba[i] = normalized;
			rgba[i + 1] = normalized;
            rgba[i + 2] = normalized; */
            rgba[i + 3] = normalized;

			if (pixelDiff >= pixelDiffThreshold) {
				score++;
				coords = calculateCoordinates(i / 4);
				if (includeMotionBox) {
					motionBox = calculateMotionBox(motionBox, coords.x, coords.y);
				}
				if (includeMotionPixels) {
					motionPixels = calculateMotionPixels(motionPixels, coords.x, coords.y, pixelDiff);	
				}
             //   console.log(score);
			// A simple volume control:
			//var xValue = (((i * (-1)) + 40) / 8) / 50; //	
			//gainNode2.gain.value = xValue; //

           // var xValue = (i * (-1)) + 249;	

           // function for normalizin value to between 0 and 1.
            var xValue = ((i * (-1)) + 125) / 125;
            // Scaling the number with generateScaleFunction
            //let filterScale = generateScaleFunction(0, 249, 15, 50); 
            var pitchValue = Math.floor(((i * (-1)) + 126) / 12.6);
          // console.log(pitchValue); 
           var frequency = getFrequency3(pitchValue, 2);
           //console.log(frequency);
           //synth.frequency.value = frequency;
           //synth.harmonicity.value = xValue * (-1);
/*             if (score > 4)
                plucky.triggerAttack(frequency, "+0.9");
                */

            //xValue = filterScale(xValue);
            // This is where any value can be controlled by the number "i".
            autoFilter.Q.value = score / 40;
            autoFilter.wet.value = xValue;
            freeverb.wet.value = 0.1;
            //pitchShift.pitch = 0;
            //freeverb.roomsize = score / 32;
            gainNode.gain.rampTo((score / 16), 0.2);
            //console.log(((i * (-1)) / 4) + 32);
            console.log(score);
            //pitchShift.pitch = Math.floor(score / 4);
            var scaleSelect = ["D#0", "F#0", "G#0", "A#0", "C#1", "D#1", "F#1", "G#1", "A#1", "C#2", "D#2", "F#2", "G#2", "A#2","C#3", "D#3", "F#3", "G#3", "A#3","C#4", "D#4", "F#4", "G#4", "A#4", "C#5", "D#5", "F#5", "G#5", "A#5", "C#6"];

            synth.triggerAttackRelease(scaleSelect[(((i * (-1)) / 4) + 32)], "2n");

            if (score == 15)
                pitchShift.pitch = 3;


                else if (score == 1)
                pitchShift.pitch = 0;

			}


        }

		return {
			score: xValue, 
			motionBox: score > scoreThreshold ? motionBox : undefined,
			motionPixels: motionPixels
        };  
	}

// CANVAS 2 PROCESSING DIFF
// The second one is the X axis, currently controlling pitch
	function processDiff2(diffImageData2) {
		
		var rgba = diffImageData2.data;
		// pixel adjustments are done by reference directly on diffImageData
		var score = 0;
		var motionPixels = includeMotionPixels2 ? [] : undefined;
		var motionBox = undefined;

        for (var i = 0; 
            i < rgba.length; i += 4) {
			var pixelDiff = rgba[i] * 0.9 + rgba[i + 1] * 0.3 + rgba[i + 2] * 0.3;
			var normalized = Math.min(255, pixelDiff * (50 / pixelDiffThreshold));
			rgba[i] = normalized; // rød
			rgba[i + 1] = normalized; // grønn
            rgba[i + 2] = 0; // blå
            rgba[i + 3] = normalized; // lysstyrke
        
			if (pixelDiff >= pixelDiffThreshold) {
				score++;
				coords = calculateCoordinates(i / 4);
				if (includeMotionBox2) {
					motionBox = calculateMotionBox(motionBox, coords.x, coords.y);
				}
				if (includeMotionPixels2) {
					motionPixels = calculateMotionPixels(motionPixels, coords.x, coords.y, pixelDiff);			
				}

			// using the x coords to change pitch

            // This function ouputs value 0-7:
			xValue2 = (((i * (-1)) + 40) / 4) - 3;

           //console.log(score);


            

       
// hvis xvalue2 ikke er 1 mutes player, hvis valuen er 1 
/*             if (xValue2 != 1) 
                player.mute = true;

            else 
                player.mute = false;

            if (xValue2 != 2) 
  
                player2.mute = true;

            else 
                player2.mute = false; */
// idé: Mappe slik at når et slags mønster hender, f.eks. bare trommer har vært i 20 sek, eller ingenting er mutet, endres mappingen?
// idé: total mengde farge i bildet avgjør mappingen (score)
// ide: parameteren, total mengde bevegelse i bildet er noe (slik appen var til å begynne med)
// idé: Dele skjermen i flere vinduer, sånn at jeg kan ha kombinerte mappinger.
// idé: Mulighet til å velge mellom flere looper
// effekter: 
//  -tempo
//  -pitch
// 

// oppgave: lage flere oppdelinger av skjermen
// oppgave: *lage en buffering-logo/animasjon
// oppgave: rydde koden


// Parametre pr. nå: 
//  * Tid
//  * xValue, yValue
// * xValue total bevegelse
// * yValue total bevegelse




            if (xValue2 == 1) 

                player.mute = false,
                player4.mute = false;

            if (xValue2 == 2) 

                player2.mute = false,
                player5.mute = false;
                
            if (xValue2 == 3) 
                player3.mute = false,
                player6.mute = false;

            if (xValue2 == 5) 
            player.mute = true,
            player4.mute = true;

            if (xValue2 == 6) 
            player2.mute = true,
            player5.mute = true;

            if (xValue2 == 7) 
            player3.mute = true,
            player6.mute = true;
/* 
            if (score >= 2)
                player.mute = true,
                player2.mute = true,
                player3.mute = true,
                player4.mute = true,
                player5.mute = true,
                player6.mute = true; */
                    
 

/*             if (xValue2 == 5 && player.mute == false) 

            player.mute = true;

            if (xValue2 == 6 && player2.mute == false) 

            player2.mute = true;

            if (xValue2 == 1 && player3.mute == false) 

            player3.mute = true;

            if (xValue2 == 2 && player4.mute == false) 

            player4.mute = true; */





			//var frequency = getFrequency(xValue2);
            // Two oscillators		
            //console.log(xValue2);
            //synth.frequency.value = frequency;
            //synth2.frequency.value = frequency;
			}
        }
		return {
			score: xValue2,
			motionBox: score > scoreThreshold ? motionBox : undefined,
			motionPixels: motionPixels
        };
	}




// Functions we don't need to duplicate:
function calculateMotionPixels(motionPixels, x, y, pixelDiff) {
    motionPixels[x] = motionPixels[x] || [];
    motionPixels[x][y] = true;

    return motionPixels;
}
function getCaptureUrl(captureImageData) {
    // may as well borrow captureCanvas
    captureContext.putImageData(captureImageData, 0, 2);
    return captureCanvas.toDataURL();
}
function checkMotionPixel(motionPixels, x, y) {
    return motionPixels && motionPixels[x] && motionPixels[x][y];
}
function getPixelDiffThreshold() {
    return pixelDiffThreshold;
}
function setPixelDiffThreshold(val) {
    pixelDiffThreshold = val;
}
function getScoreThreshold() {
    return scoreThreshold;
}
function setScoreThreshold(val) {
    scoreThreshold = val;
}
return {
    // public getters/setters
    getPixelDiffThreshold: getPixelDiffThreshold,
    setPixelDiffThreshold: setPixelDiffThreshold,
    getScoreThreshold: getScoreThreshold,
    setScoreThreshold: setScoreThreshold,

    // public functions
    init: init,
    start: start,
    stop: stop
};
function calculateCoordinates(pixelIndex) {
    return {
        x: pixelIndex % diffWidth,
        y: Math.floor(pixelIndex / diffWidth)
    };
}
function calculateMotionBox(currentMotionBox, x, y) {
    // init motion box on demand
    var motionBox = currentMotionBox || {
        x: { min: coords.x, max: x },
        y: { min: coords.y, max: y }
    };   

    motionBox.x.min = Math.min(motionBox.x.min, x);
    motionBox.x.max = Math.max(motionBox.x.max, x);
    motionBox.y.min = Math.min(motionBox.y.min, y);
    motionBox.y.max = Math.max(motionBox.y.max, y);

    return motionBox; 
}
function requestWebcam() {
    var constraints = {
        audio: false,
        video: { width: captureWidth, height: captureHeight }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(initSuccess)
        .catch(initError);
}
function initSuccess(requestedStream) {
    stream = requestedStream;
    initSuccessCallback();
}
function initError(error) {
    console.log(error);
    initErrorCallback();
}
function start() {
    if (!stream) {
        throw 'Cannot start after init fail';
    }

    // streaming takes a moment to start
    video.addEventListener('canplay', startComplete);
    video.srcObject = stream;
}
function startComplete() {
    video.removeEventListener('canplay', startComplete);
    captureInterval = setInterval(capture, captureIntervalTime);
    startCompleteCallback();
}
function stop() {
    clearInterval(captureInterval);
    video.src = '';
    motionContext.clearRect(0, 0, 1, diffHeight);
    isReadyToDiff = false;
}


})();


/// SCALING functions:
// With this function the values won't go below a threshold 
function clamp(min, max, val) {
    return Math.min(Math.max(min, +val), max);
  }
  
//Scaling any incoming number
function generateScaleFunction(prevMin, prevMax, newMin, newMax) {
var offset = newMin - prevMin,
    scale = (newMax - newMin) / (prevMax - prevMin);
return function (x) {
    return offset + scale * x;
    };
};


// Tone.js variables
// From micro
var playerBuffers = new Tone.Buffers({
	"drums" : "loops/Long_drums1.mp3", // "loops/drums1_80bpm.wav",
	"bass" : "loops/Long_bass1.mp3", // bass1_80bpm.wav",
	"arp" : "loops/Long_arp.mp3", // arp_80bpm.wav",
	"bass2" : "loops/Long_bass2.mp3", // bass2_80bpm.wav"
    "MetalSplash" : "loops/Long_MetalSplash.mp3",
    "piano" : "loops/Long_piano.mp3"
}, function(){
	//play one of the samples when they all load
	player.buffer = playerBuffers.get("drums");
	player.start();
  player2.buffer = playerBuffers.get("bass2");
	player2.start();
  player3.buffer = playerBuffers.get("arp");
	player3.start();
  player4.buffer = playerBuffers.get("bass");
	player4.start();
    player5.buffer = playerBuffers.get("MetalSplash");
	player5.start();
    player6.buffer = playerBuffers.get("piano");
	player6.start();

});

    
    ///////// TONE.JS VARIABLES ///////////
    const gainNode = new Tone.Gain().toMaster();
    const gainNode2 = new Tone.Gain().toMaster();
    const autoFilter = new Tone.AutoWah().connect(gainNode);
    const pitchShift = new Tone.PitchShift();
    pitchShift.pitch = 0;
    const freeverb = new Tone.JCReverb().connect(gainNode);
    const delay = new Tone.FeedbackDelay(0.5);
//    const synth = new Tone.DuoSynth().connect(gainNode2);

     const synth = new Tone.MonoSynth({
        oscillator: {
            type: "sine2"
        },
        envelope: {
            attack: 0.5,
            decay: 0.3,
            sustain: 1.0,
            release: 0.8
        }
    }).connect(pitchShift); 

    const plucky = new Tone.PluckSynth().chain(delay, autoFilter);

 
const player = new Tone.Player().chain(pitchShift, freeverb);
const player2 = new Tone.Player().chain(pitchShift, freeverb);
const player3 = new Tone.Player().chain(pitchShift, freeverb);
const player4 = new Tone.Player().chain(pitchShift, freeverb);
const player5 = new Tone.Player().chain(pitchShift, freeverb);
const player6 = new Tone.Player().chain(pitchShift, freeverb);

player.loop = true;
player2.loop = true;
player3.loop = true;
player4.loop = true;
player5.loop = true;
player6.loop = true;

player.autostart = true;
player2.autostart = true;
player3.autostart = true;
player4.autostart = true;
player5.autostart = true;
player6.autostart = true;

player.mute = true;
player2.mute = true;
player3.mute = true;
player4.mute = true;
player5.mute = true;
player6.mute = true;

gainNode.gain.value = 0.5;



// CHROMATIC SCALE code snippet:
// thanks to: https://gist.github.com/stuartmemo/3766449 for the following algorithm to get 
// frequencies:

var getFrequency = function (note) {
    var scaleKeys = [1, 3, 5, 6, 8, 10, 12, 13]; // for å få en skala
    //var keyNumber = note - 1;
    var keyNumber = scaleKeys[note]; // for å få en skala

    //keyNumber = keyNumber.indexOf(note);
    // slice kutter ut en del av en liste. fra det første tallet til det andre, men ikke inkludert det andre.
    // Return frequency of note
    return (440) * Math.pow(2, (keyNumber) / 12);
};

var getFrequency2 = function (keyNumber) {
    //keyNumber = keyNumber.indexOf(note);
    // slice kutter ut en del av en liste. fra det første tallet til det andre, men ikke inkludert det andre.
    // Return frequency of note
    return (440) * Math.pow(2, (keyNumber) / 12);
};


var getFrequency3 = function (note, transpose) {
    var scaleKeys = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19]; // for å få en skala
    //var keyNumber = note - 1;
    var keyNumber = scaleKeys[note] + transpose; // for å få en skala

    //keyNumber = keyNumber.indexOf(note);
    // slice kutter ut en del av en liste. fra det første tallet til det andre, men ikke inkludert det andre.
    // Return frequency of note
    return (220) * Math.pow(2, (keyNumber) / 12);
};

////////////////////////////////////////////////////////////////////////
////////// INTERACTING with HTML file //////////////////////////////////
////////////////////////////////////////////////////////////////////////
/* document.getElementById("playAudio").addEventListener("click", function(){
   
    
    
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "Synth: On"
    synth.triggerAttack(); 
  }
  else{
    this.className = "is-playing";
    this.innerHTML = "Synth: Off";
    synth.triggerRelease();
  }

}); */

/* document.getElementById("playAudio2").addEventListener("click", function(){

    
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "Effect #2 OFF"



  }else{
    this.className = "is-playing";
    this.innerHTML = "Effect #2 ON";




  }

});
 */

document.getElementById("mute").addEventListener("click", function(){
    
    
  if(this.className == 'is-playing'){
    this.className = "",
    this.innerHTML = "MUTE",
    gainNode2.gain.rampTo(0.5, 0.2),
    gainNode.gain.rampTo(0.5, 0.2);
  }else{
    this.className = "is-playing",
    this.innerHTML = "UNMUTE",
    gainNode2.gain.rampTo(0, 0.2),
    gainNode.gain.rampTo(0, 0.2);

  }

});




