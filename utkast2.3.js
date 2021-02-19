// Denne versjonen er fra 9. februar 2021.
// Med utgangspunkt i utkast2.1.js prøver jeg å rydde fila litt. 
// 10. feb: prøver å rydde litt mer.



var DiffCamEngine = (function() {
	var stream;					// stream obtained from webcam
	var video;					// shows stream
	var captureCanvas;			// internal canvas for capturing full images from video
	var captureContext;			// context for capture canvas
	var diffCanvas;				// internal canvas for diffing downscaled captures
	var diffCanvas2;			// internal canvas for diffing downscaled captures BEHOLD
	var diffContext;			// context for diff canvas
	var diffContext2;			// context for diff canvas. BEHOLD
	var motionCanvas;			// receives processed diff images
    var motionCanvas2;			// receives processed diff images for the second canvas
	var motionContext;			// context for motion canvas
    var motionContext2;			// context for motion canvas
	var initSuccessCallback;	// called when init succeeds
	var initErrorCallback;		// called when init fails
	var startCompleteCallback;	// called when start is complete
	var captureCallback;		// called when an image has been captured and diffed
	var captureCallback2;		// called when an image has been captured and diffed BEHOLD for å monitore values til HTML
	var captureInterval;		// interval for continuous captures
	var captureIntervalTime;	// time between captures, in ms
	var captureWidth;			// full captured image width
	var captureHeight;			// full captured image height
	var diffWidth;				// downscaled width for diff/motion
    var diffWidth2;				// downscaled width for diff/motion
	var diffHeight;				// downscaled height for diff/motion
    var diffHeight2;			// downscaled height for diff/motion for a second canvas
	var isReadyToDiff;			// has a previous capture been made to diff against?
	var pixelDiffThreshold;		// min for a pixel to be considered significant
	var scoreThreshold;			// min for an image to be considered significant
	var includeMotionBox;		// flag to calculate and draw motion bounding box
	var includeMotionPixels;	// flag to create object denoting pixels with motion
    var includeMotionBox2;		// flag to calculate and draw motion bounding box
	var includeMotionPixels2;	// flag to create object denoting pixels with motion


		
///////// CANVAS AND WEBCAM OPTIONS /////////////
function init(options) {
        // sanity check
        if (!options) {
            throw 'No options object provided';
        }

        // incoming options with defaults
        video = options.video || document.createElement('video');
        motionCanvas = options.motionCanvas || document.createElement('canvas');
        motionCanvas2 = options.motionCanvas2 || document.createElement('canvas2');
        captureIntervalTime = options.captureIntervalTime || 100;
        captureWidth = options.captureWidth || 900;
        captureHeight = options.captureHeight || 500;

        // Biquad Filter options:
        diffWidth = options.diffWidth || 4;
        diffHeight = options.diffHeight || 32;

        // Piano Canvas options:
        diffWidth2 = options.diffWidth2 || 8;
        diffHeight2 = options.diffHeight2 || 5;

        pixelDiffThreshold = options.pixelDiffThreshold || 32;
        scoreThreshold = options.scoreThreshold || 16;
        includeMotionBox = options.includeMotionBox || false;
        includeMotionBox2 = options.includeMotionBox2 || false;
        includeMotionPixels = options.includeMotionPixels || false;
        includeMotionPixels2 = options.includeMotionPixels2 || false;

        // callbacks
        initSuccessCallback = options.initSuccessCallback || function() {};
        initErrorCallback = options.initErrorCallback || function() {};
        startCompleteCallback = options.startCompleteCallback || function() {};
        captureCallback = options.captureCallback || function() {};
        captureCallback2 = options.captureCallback2 || function() {};

        // non-configurable
        captureCanvas = document.createElement('canvas');
        diffCanvas = document.createElement('canvas');
        diffCanvas2 = document.createElement('canvas');
        isReadyToDiff = false;

        // prep video
        video.autoplay = true;

        // prep capture canvas
        captureCanvas.width  = captureWidth;
        captureCanvas.height = captureHeight;
        captureContext = captureCanvas.getContext('2d');

        // prep diff canvas
        diffCanvas.width = 1;
        diffCanvas.height = diffHeight;

        // prep second diff canvas
        diffCanvas2.width = diffWidth2;
        diffCanvas2.height = diffHeight2;
    
        diffContext = diffCanvas.getContext('2d');
        diffContext2 = diffCanvas2.getContext('2d');

        // prep motion canvas
        motionCanvas.width = diffWidth;
        motionCanvas.height = diffHeight;
        motionContext = motionCanvas.getContext('2d');

        // prep second motion canvas
        motionCanvas2.width = diffWidth2;
        motionCanvas2.height = diffHeight2;
        motionContext2 = motionCanvas2.getContext('2d');

        requestWebcam();
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



    function capture() {
        // save a full-sized copy of capture
        captureContext.drawImage(video, 0, 0, captureWidth, 1);
        var captureImageData = captureContext.getImageData(0, 0, captureWidth, 1);
        var captureImageData2 = captureContext.getImageData(0, 4, captureWidth, 1);

        //*** behold  Koden her inne er esssensiell for oppdeling av vinduet******/
        // diff current capture over previous capture, leftover from last time
        // diffContext lager nye fraksjoner av canvas. difference og source-over må være likt.
        diffContext.globalCompositeOperation = 'difference';
        diffContext2.globalCompositeOperation = 'difference'; 
        diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);
        diffContext2.drawImage(video, 0, 0, diffWidth2, diffHeight2);   
        
        var diffImageData = diffContext.getImageData(0, 0, 2, diffHeight);
        // denne forskjellen er viktig. diffContext2 er essensiell.
        var diffImageData2 = diffContext2.getImageData(0, 4, diffWidth2, 1); // BEHOLD
        //*** behold */


////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (isReadyToDiff) {
            

            ///////// Canvas 1 (Biquad filter) ///////////
            // this is where you place the grid on the canvas
            // for å forklare hvor griden blir satt: det første tallet er y-aksen
            // og de andre tallet er x-aksen. Husk at bildet er speilvendt, 
            // så du teller fra venstre og bort.
            // Husk også at du starter på 0, så 5 blir nederste på y-aksen. Og 0 er bortese på y-aksen.
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
            ///////////////////////////////////////////
            ///////// Canvas 2 (Oscillator) ///////////
            ///////////////////////////////////////////

            var diff2 = processDiff2(diffImageData2);

            // this is where you place the grid on the canvas
            motionContext2.putImageData(diffImageData2, 0, 4);
            if (diff2.motionBox2) {
                motionContext2.strokeStyle = '#fff';
                motionContext2.strokeRect(
                    diff2.motionBox2.x.min + 0.5,
                    diff2.motionBox2.y.min + 0.5,
                    diff2.motionBox2.x.max - diff2.motionBox2.x.min,
                    diff2.motionBox2.y.max - diff2.motionBox2.y.min
                );
            }
            captureCallback2({
                imageData2: captureImageData2,
                score2: diff2.score2,
                hasMotion2: diff2.score2 >= 2,
                motionBox2: diff2.motionBox2,
                motionPixels2: diff2.motionPixels2,

            getURL: function() {
                return getCaptureUrl(this.imageData2);
            },
            checkMotionPixel: function(x, y) {
                return checkMotionPixel(this.motionPixels2, x, y)
            }
                	            
            });
        }

        // draw current capture normally over diff, ready for next time
        diffContext.globalCompositeOperation = 'source-over';
        diffContext2.globalCompositeOperation = 'source-over';
        diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);
        diffContext2.drawImage(video, 0, 0, diffWidth2, diffHeight2);
        isReadyToDiff = true;

    }



////////////////////////////////////////////////////////////////////////////////////////////////////////
// CANVAS OPTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////

// The first one is the Y axis, currently controling a Biquad Filter
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

            var xValue = ((i * (-1)) + 249) * 10;	
            biquadFilter.frequency.value = xValue;
		
			}
        }

		return {
			score: xValue, 
			motionBox: score > scoreThreshold ? motionBox : undefined,
			motionPixels: motionPixels
        };  
	}

// The second one is the X axis, currently controlling pitch

	function processDiff2(diffImageData2) {
		
		var rgba2 = diffImageData2.data;
		// pixel adjustments are done by reference directly on diffImageData
		var score2 = 0;
		var motionPixels2 = includeMotionPixels2 ? [] : undefined;
		var motionBox2 = undefined;
      
        for (var i2 = 0; 
            i2 < rgba2.length; i2 += 4) {
			var pixelDiff2 = rgba2[i2] * 0.9 + rgba2[i2 + 1] * 0.3 + rgba2[i2 + 2] * 0.3;
			var normalized2 = Math.min(255, pixelDiff2 * (50 / pixelDiffThreshold));
			     
			rgba2[i2] = normalized2; // rød
			rgba2[i2 + 1] = 0; // grønn
            rgba2[i2 + 2] = 0; // blå
            rgba2[i2 + 3] = normalized2; // lysstyrke
        
			if (pixelDiff2 >= pixelDiffThreshold) {
				score2++;
				coords2 = calculateCoordinates(i2 / 4);

				if (includeMotionBox2) {
					motionBox2 = calculateMotionBox2(motionBox2, coords2.x, coords2.y);
				}

				if (includeMotionPixels2) {
					motionPixels2 = calculateMotionPixels2(motionPixels2, coords2.x, coords2.y, pixelDiff2);			
				}


			// using the x coords to change pitch

			xValue2 = (((i2 * (-1)) + 40) / 4) - 3;
			
			var frequency = getFrequency(xValue2);
////////////////	Two oscillators //////////////		
			var o2 = ctx.createOscillator();
			o2.type = oscType2;
            o2.connect(biquadFilter);
            biquadFilter.connect(gainNode2);
            gainNode2.connect(ctx.destination);
			o2.frequency.value = frequency;
            o2.start(ctx.currentTime);
			o2.stop(ctx.currentTime + 0.1);

            var o = ctx.createOscillator();
			o.type = oscType;
            o.connect(biquadFilter);
            biquadFilter.connect(gainNode);
            gainNode.connect(ctx.destination);
			o.frequency.value = frequency * 2;
            o.start(ctx.currentTime);
			o.stop(ctx.currentTime + 0.1);
		
			}
        }

		return {
			score2: frequency,
			motionBox2: score2 > scoreThreshold ? motionBox2 : undefined,
			motionPixels2: motionPixels2
        };
	}


	function calculateCoordinates(pixelIndex) {
		return {
			x: pixelIndex % diffWidth,
			y: Math.floor(pixelIndex / diffWidth)
		};
	}

/*     function calculateCoordinates(pixelIndex2) {
		return {
			x: pixelIndex2 % diffWidth2,
			y: Math.floor(pixelIndex2 / diffWidth2)
		};
	} */

	
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

	function calculateMotionBox2(currentMotionBox2, x, y) {
		// init motion box on demand
		var motionBox2 = currentMotionBox2 || {
			x: { min: coords2.x, max: x },
			y: { min: coords2.y, max: y }
        };
        
		motionBox2.x.min = Math.min(motionBox2.x.min, x);
		motionBox2.x.max = Math.max(motionBox2.x.max, x);
		motionBox2.y.min = Math.min(motionBox2.y.min, y);
		motionBox2.y.max = Math.max(motionBox2.y.max, y);

        return motionBox2;
        
	}

	function calculateMotionPixels(motionPixels, x, y, pixelDiff) {
		motionPixels[x] = motionPixels[x] || [];
        motionPixels[x][y] = true;
    
        return motionPixels;
	}

	function calculateMotionPixels2(motionPixels2, x, y, pixelDiff2) {
		motionPixels2[x] = motionPixels2[x] || [];
        motionPixels2[x][y] = true;
        
        return motionPixels2;
	}
	function getCaptureUrl(captureImageData) {
		// may as well borrow captureCanvas
		captureContext.putImageData(captureImageData, 0, 2);
		return captureCanvas.toDataURL();
	}


	function checkMotionPixel(motionPixels, x, y) {
		return motionPixels && motionPixels[x] && motionPixels[x][y];
	}

	function checkMotionPixel2(motionPixels2, x, y) {
		return motionPixels2 && motionPixels2[x] && motionPixels2[x][y];
	}

	function getPixelDiffThreshold() {
		return pixelDiffThreshold;
	}

	function getPixelDiffThreshold2() {
		return pixelDiffThreshold;
	}

	function setPixelDiffThreshold(val) {
		pixelDiffThreshold = val;
	}

	function setPixelDiffThreshold2(val) {
		pixelDiffThreshold = val;
	}

	function getScoreThreshold() {
		return scoreThreshold;
	}

	function getScoreThreshold2() {
		return scoreThreshold;
	}

	function setScoreThreshold(val) {
		scoreThreshold = val;
	}

	function setScoreThreshold2(val) {
		scoreThreshold = val;
	}

	return {
		// public getters/setters
		getPixelDiffThreshold: getPixelDiffThreshold,
		getPixelDiffThreshold2: getPixelDiffThreshold2,
		setPixelDiffThreshold: setPixelDiffThreshold,
		setPixelDiffThreshold2: setPixelDiffThreshold2,
		getScoreThreshold: getScoreThreshold,
		getScoreThreshold2: getScoreThreshold2,
		setScoreThreshold2: setScoreThreshold2,
		setScoreThreshold: setScoreThreshold,

		// public functions
		init: init,
		start: start,
		stop: stop
	};
})();




////////////////////////////////////////////////////////////////////////
////////// INTERACTING with HTML file //////////////////////////////////
////////////////////////////////////////////////////////////////////////

document.querySelector("#button1").addEventListener('click', function() {
    oscType = 'square';
    gainNode.gain.value = 0.01;
});

document.querySelector("#button2").addEventListener('click', function() {
    oscType = 'sine'
    gainNode.gain.value = 0.01;
});

document.querySelector("#button3").addEventListener('click', function() {
    gainNode.gain.value = 0;
});

document.querySelector("#button4").addEventListener('click', function() {
    oscType2 = 'square';
    gainNode2.gain.value = 0.01;
});

document.querySelector("#button5").addEventListener('click', function() {
    oscType2 = 'sine';
    gainNode2.gain.value = 0.01;
});

document.querySelector("#button6").addEventListener('click', function() {
    gainNode2.gain.value = 0;
});

    ////////////////////////////////////////////////////////////////////////