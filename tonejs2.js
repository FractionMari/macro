    
    ///////// TONE.JS VARIABLES ///////////
    const gainNode = new Tone.Gain().toMaster();
    const autoFilter = new Tone.AutoWah().connect(gainNode);
    //const synth = new Tone.DuoSynth().connect(autoFilter);
    //const synth2 = new Tone.AMSynth().connect(autoFilter);
    const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/breakbeat.mp3").connect(gainNode);
    const player2 = new Tone.Player("https://tonejs.github.io/audio/drum-samples/handdrum-loop.mp3").connect(gainNode);
    gainNode.gain.value = 0;
    player.loop = true;
    //player.autostart = true;
    player2.loop = true;
    //player2.autostart = true;


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
    player.loop = true;
    
    
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "Synth #1 OFF"
    player.disconnect();
  }else{
    this.className = "is-playing";
    this.innerHTML = "Synth #1 ON";
    player.connect().autoFilter;

  }

});

document.getElementById("playAudio2").addEventListener("click", function(){
    player2.loop = true;
    player2.autostart = true;
    
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "Synth #2 OFF"
    player2.disconnect();
  }else{
    this.className = "is-playing";
    this.innerHTML = "Synth #2 ON";
    player2.connect().autoFilter;

  }

});


document.getElementById("mute").addEventListener("click", function(){
    gainNode.gain.rampTo(0.5, 0.2);
    
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "UNMUTE"
    gainNode.gain.rampTo(0, 0.2);
  }else{
    this.className = "is-playing";
    this.innerHTML = "MUTE";

    gainNode.gain.rampTo(0.5, 0.2);

  }

});

