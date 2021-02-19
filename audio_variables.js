    ///////// AUDIO variables /////////////
    var ctx= new (window.AudioContext || window.webkitAudioContext)();
	var gainNode = ctx.createGain();
	var gainNode2 = ctx.createGain();
	var oscType = undefined
	var oscType2 = 'square';

    // Biquad filter variables:
    var biquadFilter;
    biquadFilter = ctx.createBiquadFilter();
    // Manipulate the Biquad filter
    biquadFilter.type = "bandpass";
    biquadFilter.frequency.value = 1000;
    biquadFilter.Q.value = 1;
    biquadFilter.detune.value = 100;

    // volume variables
	gainNode.gain.value = 0.01;
	gainNode2.gain.value = 0.01;
    
    


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