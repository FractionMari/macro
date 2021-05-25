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

// Denne versjonen er fra 22. februar 2021. Ryddet og stablet.
// 18. mai: Forsøker å få det til å låte smoothere.Trigger attack-release i stedet for en kontinuerlig tone.

// Tone JS variables:

    
    ///////// TONE.JS VARIABLES ///////////
    const gainNode = new Tone.Gain().toDestination();
    const pitchShift = new Tone.PitchShift().connect(gainNode);
    const pingPong = new Tone.PingPongDelay().connect(gainNode);
    const cheby = new Tone.Chebyshev().connect(gainNode);
    const phaser = new Tone.Phaser({
      frequency: 15,
      octaves: 2,
      baseFrequency: 300
    }).connect(gainNode);
    
    const gainSynth1 = new Tone.Gain().connect(phaser);
    const gainSynth2 = new Tone.Gain().connect(phaser);

    const synth = new Tone.FMSynth().connect(gainSynth1).connect(gainSynth2);
    const synth2 = new Tone.Sampler({
        urls: {
            A1: "A1.mp3",
            A2: "A2.mp3",
        },
        baseUrl: "https://tonejs.github.io/audio/casio/",
   
    });
    const synth3 = new Tone.MembraneSynth();
    const synth4 = new Tone.DuoSynth();

    /// Yellow line of synths:
    const synth5 = new Tone.FMSynth().connect(gainSynth1).connect(gainSynth2);
    const synth6 = new Tone.Sampler({
        urls: {
            A1: "A1.mp3",
            A2: "A2.mp3",
        },
        baseUrl: "https://tonejs.github.io/audio/casio/",
   
    }).connect(gainSynth2);
    const synth7 = new Tone.MembraneSynth();
    const synth8 = new Tone.DuoSynth();

/*     const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/breakbeat.mp3").toMaster(); */
    gainNode.gain.value = 0.5;
    

////////////////////////////////////////////////////////////////////////
////////// INTERACTING with HTML file //////////////////////////////////
////////////////////////////////////////////////////////////////////////

document.getElementById("effect1").addEventListener("click", function(){

    
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "Phaser: OFF";
    gainSynth1.disconnect(phaser);
    gainSynth2.disconnect(phaser);

  
}else{
    this.className = "is-playing";
    this.innerHTML = "Phaser: ON";
    gainSynth1.connect(phaser);
    gainSynth2.connect(phaser);

  }

});

document.getElementById("effect2").addEventListener("click", function(){

    
    if(this.className == 'is-playing'){
      this.className = "";
      this.innerHTML = "PingPong: OFF";
      gainSynth1.disconnect(pingPong);
      gainSynth2.disconnect(pingPong);
  
    
  }else{
      this.className = "is-playing";
      this.innerHTML = "PingPong: ON";
      gainSynth1.connect(pingPong);
      gainSynth2.connect(pingPong);
  
    }
  
  });


document.getElementById("playAudio2").addEventListener("click", function(){
    
  if(this.className == 'is-playing'){
    this.className = "is-playing2";
    this.innerHTML = "Membrane Synth"
    //
    synth2.disconnect(gainSynth1);
    synth3.connect(gainSynth1);

}else if (this.className == 'is-playing2')
        
{
  this.className = "is-playing3";
  this.innerHTML = "Duo Synth";
  synth3.disconnect(gainSynth1);
  synth4.connect(gainSynth1);


}else if (this.className == 'is-playing3')
        
{
  this.className = "";
  this.innerHTML = "FM Synth";
  synth4.disconnect(gainSynth1);
  synth.connect(gainSynth1);

}
  
  else{
    this.className = "is-playing";
    this.innerHTML = "Sampler Synth";
    //
    synth.disconnect(gainSynth1);
    synth2.connect(gainSynth1);


  }

});
document.getElementById("playAudio3").addEventListener("click", function(){
    
    if(this.className == 'is-playing'){
      this.className = "is-playing2";
      this.innerHTML = "Membrane Synth"
      //
      synth7.disconnect(gainSynth2);
      synth8.connect(gainSynth2);
  
  }else if (this.className == 'is-playing2')
          
  {
    this.className = "is-playing3";
    this.innerHTML = "Duo Synth";
    synth8.disconnect(gainSynth2);
    synth5.connect(gainSynth2);
  
  
  }else if (this.className == 'is-playing3')
          
  {
    this.className = "";
    this.innerHTML = "FM Synth";
    synth5.disconnect(gainSynth2);
    synth6.connect(gainSynth2);
  
  }
    
    else{
      this.className = "is-playing";
      this.innerHTML = "Sampler Synth";
      //
      synth6.disconnect(gainSynth2);
      synth7.connect(gainSynth2);
  
  
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



/// DiffCam Variables:



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
        diffWidth3 = options.diffWidth3 || 8;
        diffHeight3 = options.diffHeight3 || 5;
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
    // denne forskjellen er viktig. diffContext2 er essensiell.
    var diffImageData = diffContext.getImageData(0, 0, 2, diffHeight);
    //*** behold */
    // draw current capture normally over diff, ready for next time
    diffContext.globalCompositeOperation = 'source-over';
    diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);

    // CANVAS 2:
    var captureImageData2 = captureContext.getImageData(0, 4, captureWidth, 1);
    diffContext2.globalCompositeOperation = 'difference'; 
    diffContext2.drawImage(video, 0, 0, diffWidth2, diffHeight2);   
    // denne forskjellen er viktig. diffContext2 er essensiell.
    var diffImageData2 = diffContext2.getImageData(2, 4, diffWidth2, 1); // BEHOLD
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
        
    var diffImageData3 = diffContext3.getImageData(2, 3, diffWidth3, 1); // BEHOLD
    //*** behold */
    diffContext3.globalCompositeOperation = 'source-over';
    diffContext3.drawImage(video, 0, 0, diffWidth3, diffHeight3);


    if (isReadyToDiff) {     
        // Canvas 1 (Filter):
        // this is where you place the grid on the canvas
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
 motionContext3.putImageData(diffImageData3, 2, 3);
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
			rgba[i] = 0;
			rgba[i + 1] = 0;
            rgba[i + 2] = normalized;
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
	
			// A simple volume control:
			//var xValue = (((i * (-1)) + 40) / 8) / 50; //	
			//gainNode2.gain.value = xValue; //

            var xValue = (i * (-1)) + 249;	
            // Scaling the number with generateScaleFunction
            let filterScale = generateScaleFunction(0, 249, 0, 10);      
            xValue = filterScale(xValue);
            // This is where any value can be controlled by the number "i".
            
            phaser.frequency.value = xValue;
            
            let chebyValue = Math.floor((xValue / 10) * 100);
            //console.log(chebyValue);
           cheby.order = chebyValue;
           

            //phaser.baseFrequency.rampTo(xValue, 0.2);
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
        let freq;

        for (var i = 0; 
            i < rgba.length; i += 4) {
			var pixelDiff = rgba[i] * 0.9 + rgba[i + 1] * 0.3 + rgba[i + 2] * 0.3;
            var normalized2 = Math.min(255, pixelDiff * (50 / pixelDiffThreshold));
            
			rgba[i] = normalized2; // rød
			rgba[i + 1] = 0; // grønn
            rgba[i + 2] = 0; // blå
            rgba[i + 3] = normalized2; // lysstyrke
            
        
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

            // A function for activation of notes:
            
//console.log(i);
// i vaues from left to right: 28, 24, 20, 16, 12, 8, 5
            if (i == 20)
                synth.triggerAttackRelease("C2", "4n"),
                synth2.triggerAttackRelease("C2", "4n"),
                synth3.triggerAttackRelease("C2", "4n"),
                synth4.triggerAttackRelease("C2", "4n"),
                freq = "C";
            else if (i == 16)
                synth.triggerAttackRelease("D2", "4n"),
                synth2.triggerAttackRelease("D2", "4n"),
                synth3.triggerAttackRelease("D2", "4n"),
                synth4.triggerAttackRelease("D2", "4n"),
                freq = "D";
            else if (i == 12)
                synth.triggerAttackRelease("E2", "4n"),
                synth2.triggerAttackRelease("E2", "4n"),
                synth3.triggerAttackRelease("E2", "4n"),
                synth4.triggerAttackRelease("E2", "4n"),
                freq = "E";
            else if (i == 8)
                synth.triggerAttackRelease("F2", "4n"),
                synth2.triggerAttackRelease("F2", "4n"),
                synth3.triggerAttackRelease("F2", "4n"),
                synth4.triggerAttackRelease("F2", "4n"),
                freq = "F";
            else if (i == 4)
                synth.triggerAttackRelease("G2", "4n"),
                synth2.triggerAttackRelease("G2", "4n"),
                synth3.triggerAttackRelease("G2", "4n"),
                synth4.triggerAttackRelease("G2", "4n"),
                freq = "G";
            else if (i == 0)
                synth.triggerAttackRelease("A2", "4n"),
                synth2.triggerAttackRelease("A2", "4n"),
                synth3.triggerAttackRelease("A2", "4n"),
                synth4.triggerAttackRelease("A2", "4n"),
                freq = "A";

			}
        }
		return {
			score: freq,
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
        rgba[i + 1] = normalized; // grønn
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
            
console.log(i);
// i vaues from left to right: 28, 24, 20, 16, 12, 8, 5
            if (i == 20)
                synth5.triggerAttackRelease("E3", "4n"),
                synth6.triggerAttackRelease("E3", "4n"),
                synth7.triggerAttackRelease("E3", "4n"),
                synth8.triggerAttackRelease("E3", "4n"),
                freq = "C";
            else if (i == 16)
                synth5.triggerAttackRelease("F3", "4n"),
                synth6.triggerAttackRelease("F3", "4n"),
                synth7.triggerAttackRelease("F3", "4n"),
                synth8.triggerAttackRelease("F3", "4n"),
                freq = "D";
            else if (i == 12)
                synth5.triggerAttackRelease("G3", "4n"),
                synth6.triggerAttackRelease("G3", "4n"),
                synth7.triggerAttackRelease("G3", "4n"),
                synth8.triggerAttackRelease("G3", "4n"),
                freq = "E";
            else if (i == 8)
                synth5.triggerAttackRelease("A3", "4n"),
                synth6.triggerAttackRelease("A3", "4n"),
                synth7.triggerAttackRelease("A3", "4n"),
                synth8.triggerAttackRelease("A3", "4n"),
                freq = "F";
            else if (i == 4)
                synth5.triggerAttackRelease("B3", "4n"),
                synth6.triggerAttackRelease("B3", "4n"),
                synth7.triggerAttackRelease("B3", "4n"),
                synth8.triggerAttackRelease("B3", "4n"),
                freq = "G";
            else if (i == 0)
                synth5.triggerAttackRelease("C4", "4n"),
                synth6.triggerAttackRelease("C4", "4n"),
                synth7.triggerAttackRelease("C4", "4n"),
                synth8.triggerAttackRelease("C4", "4n"),
                freq = "A";

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