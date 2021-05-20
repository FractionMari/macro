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
// Tone JS variables:

    
    ///////// TONE.JS VARIABLES ///////////
    const gainNode = new Tone.Gain().toMaster();
    const pingPong = new Tone.PingPongDelay().connect(gainNode);
    const autoFilter = new Tone.Phaser({
      frequency: 15,
      octaves: 2,
      baseFrequency: 300
    }).connect(pingPong);
    const synth = new Tone.FMSynth();
    const synth2 = new Tone.AMSynth();
    const synth3 = new Tone.PluckSynth();
    const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/breakbeat.mp3").toMaster();
    gainNode.gain.value = 0.5;
    

////////////////////////////////////////////////////////////////////////
////////// INTERACTING with HTML file //////////////////////////////////
////////////////////////////////////////////////////////////////////////

document.getElementById("effects").addEventListener("click", function(){
    Tone.start();

    const seq = new Tone.Sequence((time, note) => {
        synth.triggerAttackRelease(note, 0.1, time);
        // subdivisions are given as subarrays
    }, randomArray).start(0);

    const seq2 = new Tone.Sequence((time, note) => {
       synth2.triggerAttackRelease(note, 0.1, time);
       // subdivisions are given as subarrays
   }, randomArray2).start(0);

   const seq3 = new Tone.Sequence((time, note) => {
       synth3.triggerAttackRelease(note, 0.1, time);
       // subdivisions are given as subarrays
   }, randomArray3).start(0);
    
    // start/stop the oscllator every quarter note
    
    Tone.Transport.start();
    
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "Synth #2 OFF";
    // something
  }else{
    this.className = "is-playing";
    this.innerHTML = "Synth #2 ON";
    //synth2.connect(autoFilter);

  }

});

document.getElementById("playAudio2").addEventListener("click", function(){
    synth2.connect(autoFilter);
    
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "Synth #2 OFF"
    synth2.disconnect(autoFilter);
  }else{
    this.className = "is-playing";
    this.innerHTML = "Synth #2 ON";
    synth2.connect(autoFilter);

  }

});


document.getElementById("mute").addEventListener("click", function(){
    gainNode.gain.rampTo(0, 0.2);
    
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "MUTE"
    gainNode.gain.rampTo(0.5, 0.2);
  }else{
    this.className = "is-playing";
    this.innerHTML = "UNMUTE";

    gainNode.gain.rampTo(0, 0.2);

  }

});

Tone.Transport.bpm.value = 50;



  // Random tone generator 
  const freq = note => 2 ** (note / 12) * 440; // 440 is the frequency of A4
  // the bitwise Or does the same as Math.floor
  const notes = [ -15, -14, -13, -12, -11, -10, -9, -8, -7,  -6, -5, -4, -3 ,-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Close to your 100, 400, 1600 and 6300

  let randomArray = [];
  let randomArray2 = [];
  let randomArray3 = [];
  function createRandomness() {
    for (var i = 0; i < 100; i += 1) {

      const randomNote = () => notes[Math.random() * notes.length | 0]; // the bitwise Or does the same as Math.floor
  
      let random = freq(randomNote());
      randomArray.push(random);
  
  
      const randomNote2 = () => notes[Math.random() * notes.length | 0]; // the bitwise Or does the same as Math.floor
     let random2 = freq(randomNote2());
     randomArray2.push(random2);
  
     const randomNote3 = () => notes[Math.random() * notes.length | 0]; // the bitwise Or does the same as Math.floor
     let random3 = freq(randomNote3());
     randomArray3.push(random3);

  };
  }



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

        // CANVAS 3 VARIABLES:
	var diffCanvas3;			// internal canvas for diffing downscaled captures BEHOLD
	var diffContext3;			// context for diff canvas. BEHOLD
    var motionCanvas3;			// receives processed diff images for the second canvas
    var motionContext3;			// context for motion canvas
	var captureCallback3;		// called when an image has been captured and diffed BEHOLD for å monitore values til HTML
    var diffWidth3;				// downscaled width for diff/motion
    var diffHeight3;			// downscaled height for diff/motion for a second canvas
    var includeMotionBox3;		// flag to calculate and draw motion bounding box
	var includeMotionPixels3;	// flag to create object denoting pixels with motion

	
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
        diffWidth2 = options.diffWidth2 || 8;
        diffHeight2 = options.diffHeight2 || 5;
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


        // CANVAS 3 SETTINGS
        motionCanvas3 = options.motionCanvas3 || document.createElement('canvas3');
        diffWidth3 = options.diffWidth3 || 4;
        diffHeight3 = options.diffHeight3 || 32;
        includeMotionBox3 = options.includeMotionBox3 || false;
        includeMotionPixels3 = options.includeMotionPixels3 || false;
        captureCallback3 = options.captureCallback3 || function() {};
        diffCanvas3 = document.createElement('canvas');
        // prep second diff canvas
        diffCanvas3.width = diffWidth3;
        diffCanvas3.height = diffHeight3;
        diffContext3 = diffCanvas3.getContext('2d');
        // prep second motion canvas
        motionCanvas3.width = diffWidth3;
        motionCanvas3.height = diffHeight3;
        motionContext3 = motionCanvas3.getContext('2d');

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
    var captureImageData2 = captureContext.getImageData(2, 4, captureWidth, 1);
    diffContext2.globalCompositeOperation = 'difference'; 
    diffContext2.drawImage(video, 0, 0, diffWidth2, diffHeight2);   
    // denne forskjellen er viktig. diffContext2 er essensiell.

    // The values inside the following line must be the same as in:  
    // motionContext2.putImageData(diffImageData2, 1, 0);
    // Those values will give only one line of pixels on the canvas: var diffImageData2 = diffContext2.getImageData(1, 1, diffWidth2, diffHeight2); // BEHOLD
        
    var diffImageData2 = diffContext2.getImageData(2, 4, diffWidth2, diffHeight2); // BEHOLD
    //*** behold */
    diffContext2.globalCompositeOperation = 'source-over';
    diffContext2.drawImage(video, 0, 0, diffWidth2, diffHeight2);


    // CANVAS 3:
    var captureImageData3 = captureContext.getImageData(0, 4, captureWidth, 1);
    diffContext3.globalCompositeOperation = 'difference'; 
    diffContext3.drawImage(video, 0, 0, diffWidth3, diffHeight3);   
    // denne forskjellen er viktig. diffContext3 er essensiell.

    // The values inside the following line must be the same as in:  
    // motionContext3.putImageData(diffImageData3, 1, 0);
    // Those values will give only one line of pixels on the canvas: var diffImageData3 = diffContext3.getImageData(1, 1, diffWidth3, diffHeight3); // BEHOLD
        
    var diffImageData3 = diffContext3.getImageData(1, 3, diffWidth3, diffHeight3); // BEHOLD
    //*** behold */
    diffContext3.globalCompositeOperation = 'source-over';
    diffContext3.drawImage(video, 0, 0, diffWidth3, diffHeight3);


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
        motionContext2.putImageData(diffImageData2, 2, 4);
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


        // Canvas 3 (Oscillator):
        var diff3 = processDiff3(diffImageData3);
        // this is where you place the grid on the canvas

        // The values inside the following line must be the same as in:  
        // var diffImageData3 = diffContext3.getImageData(1, 0, diffWidth3, diffHeight3); // BEHOLD.
        // Those values will give only one line of pixels on the canvas:   motionContext3.putImageData(diffImageData3, 1, 1);
        motionContext3.putImageData(diffImageData3, 1, 3);
        if (diff3.motionBox) {
            motionContext3.strokeStyle = '#fff';
            motionContext3.strokeRect(
                diff3.motionBox.x.min + 0.5,
                diff3.motionBox.y.min + 0.5,
                diff3.motionBox.x.max - diff3.motionBox.x.min,
                diff3.motionBox.y.max - diff3.motionBox.y.min
            );
        }
        captureCallback3({
            imageData3: captureImageData3,
            // score3 her for å gi monitoring i HTMLen (husk også å legge til i diffcam1.js )
            score3: diff3.score,
            hasMotion3: diff3.score >= 2,
            motionBox: diff3.motionBox,
            motionPixels: diff3.motionPixels,
        getURL: function() {
            return getCaptureUrl(this.imageData3);
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
       
           // function for normalizin value to between 0 and 1.
            var xValue = ((i * (-1)) + 125) / 125;
            // Scaling the number with generateScaleFunction
            //let filterScale = generateScaleFunction(0, 249, 15, 50); 
            var pitchValue = Math.floor(((i * (-1)) + 126) / 12.6);
          // console.log(pitchValue); 
           var frequency = getFrequency3(pitchValue, 2);
         //  console.log(frequency);
           synth.frequency.value = frequency;
           synth.harmonicity.value = xValue * (-1);

            // This is where any value can be controlled by the number "i".
            autoFilter.Q.value = score / 40;
            autoFilter.wet.value = xValue;
  
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



                        // A function for activation of notes:
console.log(i);


// i vaues 
            if (i == 20)
                synth.connect(autoFilter);
                // synth2.triggerAttackRelease("E3", "2n");

            else if (i == 16)
                synth2.connect(autoFilter);
            else if (i == 12)
                synth3.connect(autoFilter);
             else if (i == 8)
                synth.disconnect(autoFilter);
            else if (i == 4)
                synth2.disconnect(autoFilter);
            else if (i == 0)
                synth3.disconnect(autoFilter);
			}
        }
		return {
			score: i,
			motionBox: score > scoreThreshold ? motionBox : undefined,
			motionPixels: motionPixels
        };
	}




    // CANVAS 3 PROCESSING DIFF
// The second one is the X axis, currently controlling pitch
	function processDiff3(diffImageData3) {
		
		var rgba = diffImageData3.data;
		// pixel adjustments are done by reference directly on diffImageData
		var score = 0;
		var motionPixels = includeMotionPixels3 ? [] : undefined;
		var motionBox = undefined;

        for (var i = 0; 
            i < rgba.length; i += 4) {
			var pixelDiff = rgba[i] * 0.9 + rgba[i + 1] * 0.3 + rgba[i + 2] * 0.3;
			var normalized = Math.min(255, pixelDiff * (50 / pixelDiffThreshold));
			rgba[i] = normalized; // rød
			rgba[i + 1] = 0; // grønn
            rgba[i + 2] = 0; // blå
            rgba[i + 3] = normalized // lysstyrke
        
			if (pixelDiff >= pixelDiffThreshold) {
				score++;
				coords = calculateCoordinates(i / 4);
				if (includeMotionBox3) {
					motionBox = calculateMotionBox(motionBox, coords.x, coords.y);
				}
				if (includeMotionPixels3) {
					motionPixels = calculateMotionPixels(motionPixels, coords.x, coords.y, pixelDiff);			
				}

// skriv in ting her

			}
        }
		return {
			score: score,
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
