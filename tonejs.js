    
    ///////// TONE.JS VARIABLES ///////////
    const gainNode = new Tone.Gain().toMaster();
    const pingPong = new Tone.PingPongDelay().connect(gainNode);
    const autoFilter = new Tone.Phaser({
      frequency: 15,
      octaves: 2,
      baseFrequency: 300
    }).connect(pingPong);
    const synth = new Tone.FMSynth().connect(autoFilter);
    const synth2 = new Tone.AMSynth().connect(autoFilter);
    const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/breakbeat.mp3").toMaster();
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

////////////////////////////////////////////////////////////////////////
////////// INTERACTING with HTML file //////////////////////////////////
////////////////////////////////////////////////////////////////////////
document.getElementById("playAudio").addEventListener("click", function(){
    synth.triggerAttack(); 
    
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "Synth #1 OFF"
    synth.triggerRelease();
  }else{
    this.className = "is-playing";
    this.innerHTML = "Synth #1 ON";
    synth.triggerAttack();

  }

});

document.getElementById("playAudio2").addEventListener("click", function(){
    synth2.triggerAttack(); 
    
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "Synth #2 OFF"
    synth2.triggerRelease();
  }else{
    this.className = "is-playing";
    this.innerHTML = "Synth #2 ON";
    synth2.triggerAttack();

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

