// CHECK LINES 102, 431 and 490 for source connection info
// Server Information
const socket = io.connect('/');

var sample_rate, bit_depth, buffer_size, inputDeviceArray, inputDeviceId

// Functional defs
const startVideoButton = document.getElementById('start-video-button');

// DOM points
const mainOscillator = document.getElementById('main-oscillator');
const mainOscillatorDetune = document.getElementById('main-oscillator-detune');
const sideOscillatorDetune = document.getElementById('side-oscillator-detune');
const noiseFilter = document.getElementById('noise-filter');

const freqDiv1Bank1 = document.getElementById('freq-div-1-bank1');
const freqDiv2Bank1 = document.getElementById('freq-div-2-bank1');
const freqDiv3Bank1 = document.getElementById('freq-div-3-bank1');
const freqDiv4Bank1 = document.getElementById('freq-div-4-bank1');

const freqDiv1Bank2 = document.getElementById('freq-div-1-bank2');
const freqDiv2Bank2 = document.getElementById('freq-div-2-bank2');
const freqDiv3Bank2 = document.getElementById('freq-div-3-bank2');
const freqDiv4Bank2 = document.getElementById('freq-div-4-bank2');

const subHarmGain1Slider = document.getElementById('sub-harm-gain-1');
const subHarmGain2Slider = document.getElementById('sub-harm-gain-2');
const subHarmGain3Slider = document.getElementById('sub-harm-gain-3');
const subHarmGain4Slider = document.getElementById('sub-harm-gain-4');

const formant1Freq = document.getElementById('formant-1-freq');
const formant2Freq = document.getElementById('formant-2-freq');
const formant3Freq = document.getElementById('formant-3-freq');
const formant4Freq = document.getElementById('formant-4-freq');

const formant1Q = document.getElementById('formant-1-Q');
const formant2Q = document.getElementById('formant-2-Q');
const formant3Q = document.getElementById('formant-3-Q');
const formant4Q = document.getElementById('formant-4-Q');

const formant1Type = document.getElementById('formant-type-1');
const formant2Type = document.getElementById('formant-type-2');
const formant3Type = document.getElementById('formant-type-3');
const formant4Type = document.getElementById('formant-type-4');

const formantAmp1 = document.getElementById('formant-amp-1');
const formantAmp2 = document.getElementById('formant-amp-2');
const formantAmp3 = document.getElementById('formant-amp-3');
const formantAmp4 = document.getElementById('formant-amp-4');

const mixerSliderCh1 = document.getElementById('mixer-ch1');
const mixerSliderCh2 = document.getElementById('mixer-ch2');
const mixerSliderCh3 = document.getElementById('mixer-ch3');
const mixerSliderCh4 = document.getElementById('mixer-ch4');

const setElementXPosition = document.getElementById('x-position');
const setElementYPosition = document.getElementById('y-position');
const setElementZPosition = document.getElementById('z-position');

const midiInputSelect = document.getElementById('midi-inputs');
const infoDiv = document.getElementById('info');


// http://rtoy.github.io/webaudio-hacks/tests/osc.html
// Audio variables
sample_rate = 44100; // MUST BE 44.1
bit_depth = 16;
buffer_size = 256;


const config = {
    iceServers: [{
            urls: 'stun:stun.l.google.com:19302'
        },
        // {
        //   urls: 'turn:turn.bridgr.io:3478?transport=udp',
        //   credential: '12345',
        //   username: 'daniel'
        // },
        // {
        //     urls: 'turn:numb.viagenie.ca',
        //     credential: 'muazkh',
        //     username: 'webrtc@live.com'
        // },
    ]

};
const pc = new RTCPeerConnection(config);

const context = new AudioContext({
    sampleRate: sample_rate,
    latencyHint: 'interactive',
    channelCount: 8
});

// context.destination.channelCountMode = 'max';
// context.destination.channelCount = 8;
// context.destination.numberOfInputs = 4;
// context.destination.numberOfOutputs = 4;

let source;
// const videoStream = document.getElementById('mainVideoTag')
const otherVideoStream = document.getElementById('otherVideoTag')

const handleVideo = function (streamVid) {
    source = context.createMediaStreamSource(streamVid);
    // source.connect(context.destination);

    document.getElementById('base-latency-div').innerText = 'Base Latency (in seconds): ' + context.baseLatency;

    pc.addTrack(streamVid.getAudioTracks()[0], streamVid);
    pc.addTrack(streamVid.getVideoTracks()[0], streamVid); // This shows video. The capture is automatic.

}

let counter = 0;
pc.ontrack = e => {
    counter++;
    // Prevent double load
    if (counter == 2) {



        e.track.onunmute = () => {

            // THIS IS THE VIDEO BUT IT ALSO SENDS AUDIO
            // // This is the audio and video stream, find a way to just send video here without original audio.
            otherVideoStream.srcObject = e.streams[0];
            // otherVideoStream.connect(context.destination); // DOESNT WORK
        }


        // This is the incoming audio stream!  This is where you can build the audio processing core
        // let source = context.createMediaStreamSource(e.streams[0]); // Stream


        // let source = context.createOscillator();
        // source.type = 'square';
        // source.frequency.setValueAtTime(110, context.currentTime); // value in hertz
        // source.connect(context.destination);
        // source.start();


        let mainOsc = context.createOscillator();
        mainOsc.type = 'square';
        mainOsc.frequency.setValueAtTime(220, context.currentTime);
        // Add octave switch
        mainOsc.start();


        let subHarmonicGen1 = context.createOscillator();
        subHarmonicGen1.type = 'sawtooth';
        subHarmonicGen1.frequency.value = 220 / freqDiv1Bank1.value;
        let subHarmonicGen2 = context.createOscillator();
        subHarmonicGen2.type = 'sawtooth';
        subHarmonicGen2.frequency.value = 220 / freqDiv2Bank1.value;
        let subHarmonicGen3 = context.createOscillator();
        subHarmonicGen3.type = 'sawtooth';
        subHarmonicGen3.frequency.value = 220 / freqDiv3Bank1.value;
        let subHarmonicGen4 = context.createOscillator();
        subHarmonicGen4.type = 'sawtooth';
        subHarmonicGen4.frequency.value = 220 / freqDiv4Bank1.value;
        subHarmonicGen1.start();
        subHarmonicGen2.start();
        subHarmonicGen3.start();
        subHarmonicGen4.start();

        let randomSubHarmonic1;
        let randomSubHarmonic2;
        let randomSubHarmonic3;
        let randomSubHarmonic4;

        let subHarmGain1 = context.createGain();
        let subHarmGain2 = context.createGain();
        let subHarmGain3 = context.createGain();
        let subHarmGain4 = context.createGain();


        let sideOsc = context.createOscillator();
        sideOsc.type = 'triangle';
        // Add octave switch
        sideOsc.start();

        // Create Noise Generator
        let noiseSource;
        let bufferSize = 2 * context.sampleRate,
            noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate),
            output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        noiseSource = context.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        noiseSource.start(0);

        let noiseSourceFilter = context.createBiquadFilter();
        noiseSourceFilter.type = 'bandpass';


        let mixerCh1 = context.createGain();
        mixerCh1.gain.value = 0;
        let mixerCh2 = context.createGain();
        mixerCh2.gain.value = 0;
        let mixerCh3 = context.createGain();
        mixerCh3.gain.value = 0;
        let mixerCh4 = context.createGain();
        mixerCh4.gain.value = 0;

        let mixerOutput = context.createGain();
        mixerOutput.gain.setValueAtTime(1, context.currentTime)

        let formantFilter1 = context.createBiquadFilter();
        formantFilter1.type = 'bandpass';
        formantFilter1.Q.setValueAtTime(3, context.currentTime)

        let formantFilter2 = context.createBiquadFilter();
        formantFilter2.type = 'bandpass';
        formantFilter2.Q.setValueAtTime(3, context.currentTime)

        let formantFilter3 = context.createBiquadFilter();
        formantFilter3.type = 'bandpass';
        formantFilter3.Q.setValueAtTime(3, context.currentTime)

        let formantFilter4 = context.createBiquadFilter();
        formantFilter4.type = 'bandpass';
        formantFilter4.Q.setValueAtTime(3, context.currentTime)

        let formantMixer1 = context.createGain();
        let formantMixer2 = context.createGain();
        let formantMixer3 = context.createGain();
        let formantMixer4 = context.createGain();

        let vca1 = context.createGain();

        function logSlider(position, minValue, maxValue) {
            var minp = 0;
            var maxp = 1270;
            var minv = Math.log(minValue);
            var maxv = Math.log(maxValue);
            var scale = (maxv - minv) / (maxp - minp);
            return Math.exp(minv + scale * (position - minp));
        }

        // Start score SCORE GOES HERE
        const scoreButton = document.querySelector('#score-button');
        scoreButton.addEventListener('click', function () {
            scoreButton.remove();
            context.resume().then(() => {
                                
                const launchInfoDiv = document.querySelector('.launch-info');
                launchInfoDiv.remove();
                const allPlayers = document.querySelectorAll('.all-players');
                const player1 = document.querySelector('#player1');

                const allPlayersImgs = document.querySelectorAll('.all-players-imgs');

                const actions = ['./assets/score/score_1.png',
                    './assets/score/score_2.png',
                    './assets/score/score_3.png',
                    './assets/score/score_4.png',
                    './assets/score/score_5.png',
                    './assets/score/score_6.png',
                    './assets/score/score_7.png',
                    './assets/score/score_8.png',
                    './assets/score/score_9.png',
                    './assets/score/score_10.png',
                    './assets/score/score_11.png',
                    './assets/score/score_12.png',
                ];
                

                function fadeIn(element) {
                    var op = 0.1; // initial opacity
                    element.style.display = 'block';
                    var timer = setInterval(function () {
                        if (op >= 1) {
                            clearInterval(timer);
                        }
                        element.style.opacity = op;
                        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
                        op += op * 0.1;
                    }, 10);
                }

                function fadeOut(element) {
                    var op = 1; // initial opacity
                    var timer = setInterval(function () {
                        if (op <= 0.1) {
                            clearInterval(timer);
                            element.style.display = 'none';
                        }
                        element.style.opacity = op;
                        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
                        op -= op * 0.1;
                    }, 10);
                }

                for (let i = 0; i < allPlayers.length; i++) {
                    allPlayers[i].style.visibility = 'visible';
                    allPlayersImgs[0].innerHTML = 'Wire Transfer 3 <br /> Daniel McKemie <br /> May 2023';
                    setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 5000);
                }

                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Timings are approximate.  Listen but do not follow.';
                    fadeIn(allPlayersImgs[0]);                                                            
                }, 6000);
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 9000);

                // 0'00"-0'30" - RIP!
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'RIP!';
                    fadeIn(allPlayersImgs[0])                    
                }, 10000); // Section start time (plus 10000) 
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 39000); // 1 second before start time of next section

                // 0'30"- 1'15" - Sustain a frequency. Play with filters, subharmonic mixes, subharmonic divisions. You can change main oscillator frequency, but not drastically. Demonstrate the instrument.
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Sustain a frequency. Demonstrate the instrument.  Nothing drastic.';
                    fadeIn(allPlayersImgs[0]);                   
                }, 40000); // Section start time (plus 10000)
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 84000); // 1 second before start time of next section

                                
                // 1'15"-2'00" - Short, quick sounds.
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Short, quick sounds';
                    fadeIn(allPlayersImgs[0]);                    
                }, 85000); // Section start time (plus 10000)
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 129000);

                
                
                // 2'00"-2'30" - Build into RIP!
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Build';
                    fadeIn(allPlayersImgs[0]);                    
                }, 130000); // Section start time (plus 10000)
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 159000);
                
                
                // 2'30"-3'15" - Smith solo; DMcK sustains/slowly fades to silence
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Smith solo; DMcK sustains/slowly fades to silence';
                    fadeIn(allPlayersImgs[0]);                    
                }, 160000); // Section start time (plus 10000)
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 204000);
                
                // 3'15"-3'30" - Smith solo only; DMcK out
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Smith solo only. Freestyle; DMcK out';
                    fadeIn(allPlayersImgs[0]);                    
                }, 205000); // Section start time (plus 10000)
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 219000);
                
                
                // 3'30"-4'30" - Play smoothly. Nicely. Try to synchronize something, but not really.
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Play smoothly. Nicely. Try to synchronize something, but not really.';
                    fadeIn(allPlayersImgs[0]);                    
                }, 220000); // Section start time (plus 10000)
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 279000);
                
                // 4'30"-5'15" - Smith sustains/slowly fades to silence; DMcK solos.
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Smith sustains/slowly fades to silence; DMcK solos';
                    fadeIn(allPlayersImgs[0]);                    
                }, 280000); // Section start time (plus 10000)
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 324000);

                
                
                // 5'15"-5'45" - Smith silent; DMcK solo only
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Smith silent; DMcK solo only';
                    fadeIn(allPlayersImgs[0]);                    
                }, 325000); // Section start time (plus 10000)
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 354000);
                
                
                // 5'45"-6'15" - Smith solo; DMcK silent ("crossfade" from previous section)
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Smith solo; DMcK silent ("crossfade" from previous section)';
                    fadeIn(allPlayersImgs[0]);                    
                }, 355000); // Section start time (plus 10000)
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 384000);
                
                
                // 6'15"-6'45" - Play smoothly with periodic rips. Play off what you hear and what sounds good. DEEP LISTEN.
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Play smoothly with periodic rips. Play off what you hear and what sounds good. DEEP LISTEN.';
                    fadeIn(allPlayersImgs[0]);                    
                }, 385000); // Section start time (plus 10000)
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 414000);
                
                // 6'45"-7'00" - Short sounds. Become sparser as time goes on.                
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'Short sounds. Become sparser as time goes on';
                    fadeIn(allPlayersImgs[0]);                    
                }, 415000); // Section start time (plus 10000) 
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 429000);
                
                
                // Around 7'00" - End the piece.                
                setTimeout(() => {
                    allPlayersImgs[0].innerText = 'End the piece';
                    fadeIn(allPlayersImgs[0]);                    
                }, 430000); // Section start time (plus 10000)
                setTimeout(() => {
                        fadeOut(allPlayersImgs[0]);
                    }, 440000);

    

            //     for (let i = 0; i < allPlayers.length; i++) {
            //         allPlayers[i].style.visibility = 'visible';
            //         allPlayersImgs[i].src = './assets/score_1.png';
            //         setTimeout(() => {
            //             fadeOut(allPlayersImgs[i]);
            //         }, 9000);
            //     }


            //     setInterval(() => {
            //         for (let i = 0; i < allPlayersImgs.length; i++) {
            //             let randomAction = Math.floor(Math.random() * 3);
            //             // allPlayersImgs[i].innerHTML = actions[randomAction];
            //             allPlayersImgs[i].src = actions[randomAction];
            //             fadeIn(allPlayersImgs[i]);
            //             setTimeout(() => {
            //                 fadeOut(allPlayersImgs[i]);
            //             }, 9000);
            //         }

            //     }, 11000);

            });
        });

        let freqDivided = false;


        // Modularize these next
        mainOscillator.addEventListener('input', function () {
            if (freqDivided == true) {
                mainOsc.frequency.value = logSlider((mainOscillator.value), 20, 5000);
                sideOsc.frequency.value = logSlider((mainOscillator.value), 20, 5000);
                subHarmonicGen1.frequency.value = logSlider((mainOscillator.value), 20, 5000) / freqDiv1Bank2.value;
                subHarmonicGen2.frequency.value = logSlider((mainOscillator.value), 20, 5000) / freqDiv2Bank2.value;
                subHarmonicGen3.frequency.value = logSlider((mainOscillator.value), 20, 5000) / freqDiv3Bank2.value;
                subHarmonicGen4.frequency.value = logSlider((mainOscillator.value), 20, 5000) / freqDiv4Bank2.value;
            } else {
                mainOsc.frequency.value = logSlider((mainOscillator.value), 20, 5000);
                sideOsc.frequency.value = logSlider((mainOscillator.value), 20, 5000);
                subHarmonicGen1.frequency.value = logSlider((mainOscillator.value), 20, 5000) / freqDiv1Bank1.value;
                subHarmonicGen2.frequency.value = logSlider((mainOscillator.value), 20, 5000) / freqDiv2Bank1.value;
                subHarmonicGen3.frequency.value = logSlider((mainOscillator.value), 20, 5000) / freqDiv3Bank1.value;
                subHarmonicGen4.frequency.value = logSlider((mainOscillator.value), 20, 5000) / freqDiv4Bank1.value;
            }
        })

        // FINE TUNE
        mainOscillatorDetune.addEventListener('input', function () {
            mainOsc.detune.value = mainOscillatorDetune.value;
            subHarmonicGen1.detune.value = mainOscillatorDetune.value;
            subHarmonicGen2.detune.value = mainOscillatorDetune.value;
            subHarmonicGen3.detune.value = mainOscillatorDetune.value;
            subHarmonicGen4.detune.value = mainOscillatorDetune.value;

        })
        sideOscillatorDetune.addEventListener('input', function () {
            sideOsc.detune.value = sideOscillatorDetune.value;
        })

        noiseFilter.addEventListener('input', function () {
            noiseSourceFilter.frequency.value = logSlider((noiseFilter.value), 20, 20000);
        })



        // window.addEventListener('keydown', function () {
        //     if (freqDivided == false) {
        //         freqDivided = true;
        //         subHarmonicGen1.frequency.value = mainOscillator.value / freqDiv1Bank2.value;
        //         subHarmonicGen2.frequency.value = mainOscillator.value / freqDiv2Bank2.value;
        //         subHarmonicGen3.frequency.value = mainOscillator.value / freqDiv3Bank2.value;
        //         subHarmonicGen4.frequency.value = mainOscillator.value / freqDiv4Bank2.value;
        //     }

        // })

        // window.addEventListener('keyup', function () {
        //     freqDivided = false;
        //     subHarmonicGen1.frequency.value = mainOscillator.value / freqDiv1Bank1.value;
        //     subHarmonicGen2.frequency.value = mainOscillator.value / freqDiv2Bank1.value;
        //     subHarmonicGen3.frequency.value = mainOscillator.value / freqDiv3Bank1.value;
        //     subHarmonicGen4.frequency.value = mainOscillator.value / freqDiv4Bank1.value;
        // })

        subHarmGain1Slider.addEventListener('input', function () {
            subHarmGain1.gain.value = subHarmGain1Slider.value / 100.0;
        })
        subHarmGain2Slider.addEventListener('input', function () {
            subHarmGain2.gain.value = subHarmGain2Slider.value / 100.0;
        })
        subHarmGain3Slider.addEventListener('input', function () {
            subHarmGain3.gain.value = subHarmGain3Slider.value / 100.0;
        })
        subHarmGain4Slider.addEventListener('input', function () {
            subHarmGain4.gain.value = subHarmGain4Slider.value / 100.0;
        })

        formant1Freq.addEventListener('input', function () {
            formantFilter1.frequency.value = logSlider(formant1Freq.value, 50, 5000);
        })
        formant1Q.addEventListener('input', function () {
            formantFilter1.Q.value = logSlider(formant1Q.value, 1, 10);
        })
        formant1Type.addEventListener('input', function () {
            if (formant1Type.checked == true) {
                formantFilter1.type = 'bandpass';
            } else {
                formantFilter1.type = 'lowpass';
            }
        })

        formant2Freq.addEventListener('input', function () {
            formantFilter2.frequency.value = logSlider(formant2Freq.value, 50, 5000);
        })
        formant2Q.addEventListener('input', function () {
            formantFilter2.Q.value = logSlider(formant2Q.value, 1, 10);
        })
        formant2Type.addEventListener('input', function () {
            if (formant2Type.checked == true) {
                formantFilter2.type = 'bandpass';
            } else {
                formantFilter2.type = 'lowpass';
            }
        })

        formant3Freq.addEventListener('input', function () {
            formantFilter3.frequency.value = logSlider(formant3Freq.value, 50, 5000);
        })
        formant3Q.addEventListener('input', function () {
            formantFilter3.Q.value = logSlider(formant3Q.value, 1, 10);
        })
        formant3Type.addEventListener('input', function () {
            if (formant3Type.checked == true) {
                formantFilter3.type = 'bandpass';
            } else {
                formantFilter3.type = 'lowpass';
            }
        })

        formant4Freq.addEventListener('input', function () {
            formantFilter4.frequency.value = logSlider(formant4Freq.value, 50, 5000);
        })
        formant4Q.addEventListener('input', function () {
            formantFilter4.Q.value = logSlider(formant4Q.value, 1, 10);
        })
        formant4Type.addEventListener('input', function () {
            if (formant4Type.checked == true) {
                formantFilter4.type = 'bandpass';
            } else {
                formantFilter4.type = 'lowpass';
            }
        })

        formantAmp1.addEventListener('input', function () {
            formantMixer1.gain.value = formantAmp1.value / 100.0;
        })
        formantAmp2.addEventListener('input', function () {
            formantMixer2.gain.value = formantAmp2.value / 100.0;
        })
        formantAmp3.addEventListener('input', function () {
            formantMixer3.gain.value = formantAmp3.value / 100.0;
        })
        formantAmp4.addEventListener('input', function () {
            formantMixer4.gain.value = formantAmp4.value / 100.0;
        })

        mixerSliderCh1.addEventListener('input', function () {
            mixerCh1.gain.value = mixerSliderCh1.value / 100.0;
        })

        mixerSliderCh2.addEventListener('input', function () {
            mixerCh2.gain.value = mixerSliderCh2.value / 100.0;
        })

        mixerSliderCh3.addEventListener('input', function () {
            mixerCh3.gain.value = mixerSliderCh3.value / 100.0;
        })

        mixerSliderCh4.addEventListener('input', function () {
            mixerCh4.gain.value = mixerSliderCh4.value / 100.0;
        })


        // VCA1 Input - Pressure from Slider
        vca1.gain.value = 0.1;
        // VCA2 Input - Foot Controller




        subHarmonicGen1.connect(subHarmGain1).connect(mixerCh1).connect(mixerOutput);
        subHarmonicGen2.connect(subHarmGain2).connect(mixerCh1).connect(mixerOutput);
        subHarmonicGen3.connect(subHarmGain3).connect(mixerCh1).connect(mixerOutput);
        subHarmonicGen4.connect(subHarmGain4).connect(mixerCh1).connect(mixerOutput);
        mainOsc.connect(mixerCh2).connect(mixerOutput);
        sideOsc.connect(mixerCh3).connect(mixerOutput);
        noiseSource.connect(noiseSourceFilter).connect(mixerCh4).connect(mixerOutput);


        mixerOutput.connect(formantFilter1);
        mixerOutput.connect(formantFilter2);
        mixerOutput.connect(formantFilter3);
        mixerOutput.connect(formantFilter4);

        formantFilter1.connect(formantMixer1).connect(vca1);
        formantFilter2.connect(formantMixer2).connect(vca1);
        formantFilter3.connect(formantMixer3).connect(vca1);
        formantFilter4.connect(formantMixer4).connect(vca1);

        // Is this needed? 
        // vca1.connect(context.destination);

        // UNCOMMENT FOR RESONANCE

        // Resonance Audio/Room
        let resonanceAudioScene = new ResonanceAudio(context);
        let roomDimensions = {
            width: 2.1,
            height: 1.5,
            depth: 2.4,
        };

        let roomMaterials = {
            // Room wall materials
            left: 'brick-bare',
            right: 'brick-bare',
            front: 'marble',
            back: 'marble',
            // Room floor
            down: 'marble',
            // Room ceiling
            up: 'brick-bare',
        };

        resonanceAudioScene.setRoomProperties(roomDimensions, roomMaterials);
        let resonanceSource = resonanceAudioScene.createSource();
        vca1.connect(resonanceSource.input);


        let xPos;
        let yPos;
        let zPos;
        setElementXPosition.addEventListener('input', function () {
            xPos = setElementXPosition.value / 100.0;
            yPos = yPos
            zPos = zPos;
            resonanceSource.setPosition(xPos, yPos, zPos);
        })
        setElementYPosition.addEventListener('input', function () {
            xPos = xPos;
            yPos = setElementYPosition.value / 100.0;
            zPos = zPos;
            resonanceSource.setPosition(xPos, yPos, zPos);
        })

        setElementZPosition.addEventListener('input', function () {
            xPos = xPos;
            yPos = yPos;
            zPos = setElementZPosition.value / 100.0;
            resonanceSource.setPosition(xPos, yPos, zPos);
        })

        resonanceSource.setPosition(-0.707, -0.707, 0);


        // const primaryOutL = new GainNode(context);
        // const primaryOutR = new GainNode(context);

        // primaryOutL.gain.value = 1;
        // primaryOutR.gain.value = 1;

        // const splitterNode = new ChannelSplitterNode(context, {
        //     numberOfOutputs: 2
        // });

        // const mergerNode = new ChannelMergerNode(context, {
        //     numberOfInputs: 4
        // });

        // // resonanceAudioScene.output.connect(splitterNode);
        // source.connect(splitterNode);

        // splitterNode.connect(primaryOutL, 0); // connect OUTPUT channel 0
        // splitterNode.connect(primaryOutR, 1); // connect OUTPUT channel 1

        // primaryOutL.connect(mergerNode, 2, 0); // connect INPUT channel 0
        // primaryOutR.connect(mergerNode, 3, 1); // connect INPUT channel 1

        // splitterNode.connect(context.destination);

        var stereoSource = context.createChannelMerger(2);
        source.connect(stereoSource, 0, 0);
        resonanceAudioScene.output.connect(stereoSource, 0, 0);

        var splitter = context.createChannelSplitter(2);
        var flipper = context.createChannelMerger(2);


        stereoSource.connect(splitter);
        splitter.connect(flipper, 0, 1);
        // splitter.connect(resonanceAudioScene.output, 1, 0);
        
        /*
        UNCOMMENT TO TURN AUDIO BACK ON!!!
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        */
        // Uncomment this to turn audio back on...
        //flipper.connect(context.destination);


        // resonanceAudioScene.output.connect(context.destination);


        // This is the other player's stream
        // source.output.connect(context.destination);






        // WEBMIDI
        WebMidi.enable(function (err) {
            if (err) {
                console.log('WebMidi could not be enabled.', err);
                infoDiv.innerHTML = ('WebMidi could not be enabled', err);
            } else {
                console.log('WedMidi enabled!');

                // for (index in WebMidi.inputs) {
                //     midiInputSelect.options[midiInputSelect.options.length] = new Option(WebMidi.inputs[index].name, index);
                // }

                // input = null;                                
                let inputQuNeo = WebMidi.getInputByName('QuNeo');
                // let inputKorg = WebMidi.getInputByName('nanoKONTROL2 SLIDER/KNOB'); // Determine actual name

                // function getMidiInput() {
                //     console.log(midiInputSelect.options[midiInputSelect.selectedIndex].text);
                //     return input = WebMidi.getInputByName(midiInputSelect.options[midiInputSelect.selectedIndex].text);
                // }
                // midiInputSelect.addEventListener('change', getMidiInput)

                // MIDI Channel 1. QuNeo                
                if (inputQuNeo != false) {
                    inputQuNeo.addListener('controlchange', 'all',
                        function (e) {
                            // console.log(e);
                            // console.log(`Chan: ${e.channel} / CC: ${e.data[1]} / Value: ${e.data[2]}`);
                            switch (e.data[1]) {
                                case 22: // Horizontal Slider Pressure
                                    mixerSliderCh1.value = e.data[2];
                                    mixerCh1.gain.value = e.data[2] / 100;
                                    break;
                                    // case 4: // Rotary to control and lock all SubHarm Amps at equal value
                                    //     subHarmGain1Slider.value = (e.data[2] * 10) - 27;
                                    //     subHarmGain2Slider.value = (e.data[2] * 10) - 27;
                                    //     subHarmGain3Slider.value = (e.data[2] * 10) - 27;
                                    //     subHarmGain4Slider.value = (e.data[2] * 10) - 27;
                                    //     subHarmGain1.gain.value = (e.data[2] - 27) / 100.0;
                                    //     subHarmGain2.gain.value = (e.data[2] - 27) / 100.0;
                                    //     subHarmGain3.gain.value = (e.data[2] - 27) / 100.0;
                                    //     subHarmGain4.gain.value = (e.data[2] - 27) / 100.0;
                                    //     break;
                                    // case 5: // Rotary to lock all Amps 
                                    //     mixerSliderCh1.value = e.data[2] - 27;
                                    //     mixerSliderCh2.value = (e.data[2] - 63) - 27;
                                    //     mixerSliderCh3.value = (e.data[2] - 63) - 27;
                                    //     mixerSliderCh4.value = e.data[2] - 27;
                                    //     mixerCh1.gain.value = e.data[2] / 127;
                                    //     mixerCh2.gain.value = (e.data[2] - 63) / 127; // Lower for main osc
                                    //     mixerCh3.gain.value = (e.data[2] - 63) / 127; // Lower for side osc
                                    //     mixerCh4.gain.value = e.data[2] / 127;
                                    break;
                                case 83: // Kill all amps
                                    mixerSliderCh1.value = 0;
                                    mixerSliderCh2.value = 0;
                                    mixerSliderCh3.value = 0;
                                    mixerSliderCh4.value = 0;
                                    mixerCh1.gain.value = 0;
                                    mixerCh2.gain.value = 0;
                                    mixerCh3.gain.value = 0;
                                    mixerCh4.gain.value = 0;
                                    break;
                                case 82: // All amps max
                                    mixerSliderCh1.value = 100;
                                    mixerSliderCh2.value = 100;
                                    mixerSliderCh3.value = 100;
                                    mixerSliderCh4.value = 100;
                                    mixerCh1.gain.value = 1;
                                    mixerCh2.gain.value = 1;
                                    mixerCh3.gain.value = 1;
                                    mixerCh4.gain.value = 1;
                                    break;
                                case 10: // Horizontal Slider Pos
                                    mainOscillator.value = e.data[2] * 10;
                                    mainOsc.frequency.value = logSlider((e.data[2]) * 10, 20, 5000);
                                    sideOsc.frequency.value = logSlider(e.data[2] * 10, 20, 5000);
                                    if (freqDivided == true) {
                                        subHarmonicGen1.frequency.value = logSlider(e.data[2] * 10, 20, 5000) / freqDiv1Bank2.value;
                                        subHarmonicGen2.frequency.value = logSlider(e.data[2] * 10, 20, 5000) / freqDiv2Bank2.value;
                                        subHarmonicGen3.frequency.value = logSlider(e.data[2] * 10, 20, 5000) / freqDiv3Bank2.value;
                                        subHarmonicGen4.frequency.value = logSlider(e.data[2] * 10, 20, 5000) / freqDiv4Bank2.value;

                                    } else {
                                        subHarmonicGen1.frequency.value = logSlider(e.data[2] * 10, 20, 5000) / freqDiv1Bank1.value;
                                        subHarmonicGen2.frequency.value = logSlider(e.data[2] * 10, 20, 5000) / freqDiv2Bank1.value;
                                        subHarmonicGen3.frequency.value = logSlider(e.data[2] * 10, 20, 5000) / freqDiv3Bank1.value;
                                        subHarmonicGen4.frequency.value = logSlider(e.data[2] * 10, 20, 5000) / freqDiv4Bank1.value;
                                    }
                                    break;
                                case 0:
                                    subHarmGain1Slider.value = e.data[2] * 10;
                                    subHarmGain1.gain.value = e.data[2] / 100.0
                                    break;
                                case 1:
                                    subHarmGain2Slider.value = e.data[2] * 10;
                                    subHarmGain2.gain.value = e.data[2] / 100.0
                                    break;
                                case 2:
                                    subHarmGain3Slider.value = e.data[2] * 10;
                                    subHarmGain3.gain.value = e.data[2] / 100.0
                                    break;
                                case 3:
                                    subHarmGain4Slider.value = e.data[2] * 10;
                                    subHarmGain4.gain.value = e.data[2] / 100.0
                                    break;
                                case 6:
                                    formant1Freq.value = e.data[2] * 10;
                                    formantFilter1.frequency.value = logSlider(e.data[2] * 10, 50, 5000);
                                    break;
                                case 7:
                                    formant2Freq.value = e.data[2] * 10;
                                    formantFilter2.frequency.value = logSlider(e.data[2] * 10, 50, 5000);
                                    break;
                                case 8:
                                    formant3Freq.value = e.data[2] * 10;
                                    formantFilter3.frequency.value = logSlider(e.data[2] * 10, 50, 5000);
                                    break;
                                case 9:
                                    formant4Freq.value = e.data[2] * 10;
                                    formantFilter4.frequency.value = logSlider(e.data[2] * 10, 50, 5000);
                                    break;
                                case 23:
                                    if (freqDivided == false && e.data[2] > 0) {
                                        freqDivided = true;
                                        subHarmonicGen1.frequency.value = mainOscillator.value / freqDiv1Bank2.value;
                                        subHarmonicGen2.frequency.value = mainOscillator.value / freqDiv2Bank2.value;
                                        subHarmonicGen3.frequency.value = mainOscillator.value / freqDiv3Bank2.value;
                                        subHarmonicGen4.frequency.value = mainOscillator.value / freqDiv4Bank2.value;
                                        break;
                                    } else if (freqDivided == true && e.data[2] == 0) {
                                        freqDivided = false;
                                        subHarmonicGen1.frequency.value = mainOscillator.value / freqDiv1Bank1.value;
                                        subHarmonicGen2.frequency.value = mainOscillator.value / freqDiv2Bank1.value;
                                        subHarmonicGen3.frequency.value = mainOscillator.value / freqDiv3Bank1.value;
                                        subHarmonicGen4.frequency.value = mainOscillator.value / freqDiv4Bank1.value;
                                        break;
                                    }
                                    break;
                                case 26:
                                    if (freqDivided == false && e.data[2] > 0) {
                                        randomSubHarmonic1 = Math.floor(Math.random() * 24) + 1;
                                        randomSubHarmonic2 = Math.floor(Math.random() * 24) + 1;
                                        randomSubHarmonic3 = Math.floor(Math.random() * 24) + 1;
                                        randomSubHarmonic4 = Math.floor(Math.random() * 24) + 1;
                                        freqDivided = true;
                                        subHarmonicGen1.frequency.value = mainOscillator.value / randomSubHarmonic1;
                                        subHarmonicGen2.frequency.value = mainOscillator.value / randomSubHarmonic2;
                                        subHarmonicGen3.frequency.value = mainOscillator.value / randomSubHarmonic3;
                                        subHarmonicGen4.frequency.value = mainOscillator.value / randomSubHarmonic4;
                                        break;
                                    } else if (freqDivided == true && e.data[2] == 0) {
                                        freqDivided = false;
                                        subHarmonicGen1.frequency.value = mainOscillator.value / freqDiv1Bank1.value;
                                        subHarmonicGen2.frequency.value = mainOscillator.value / freqDiv2Bank1.value;
                                        subHarmonicGen3.frequency.value = mainOscillator.value / freqDiv3Bank1.value;
                                        subHarmonicGen4.frequency.value = mainOscillator.value / freqDiv4Bank1.value;
                                        break;
                                    }
                                    break;
                                case 29:
                                    if (freqDivided == false && e.data[2] > 0) {
                                        freqDivided = true;
                                        subHarmonicGen1.frequency.value = mainOscillator.value / freqDiv1Bank2.value;
                                        subHarmonicGen2.frequency.value = mainOscillator.value / freqDiv2Bank2.value;
                                        subHarmonicGen3.frequency.value = mainOscillator.value / freqDiv3Bank2.value;
                                        subHarmonicGen4.frequency.value = mainOscillator.value / freqDiv4Bank2.value;
                                        break;
                                    } else if (freqDivided == true && e.data[2] == 0) {
                                        freqDivided = false;
                                        subHarmonicGen1.frequency.value = mainOscillator.value / freqDiv1Bank1.value;
                                        subHarmonicGen2.frequency.value = mainOscillator.value / freqDiv2Bank1.value;
                                        subHarmonicGen3.frequency.value = mainOscillator.value / freqDiv3Bank1.value;
                                        subHarmonicGen4.frequency.value = mainOscillator.value / freqDiv4Bank1.value;
                                        break;
                                    }
                                    break;
                                case 32:
                                    if (freqDivided == false && e.data[2] > 0) {
                                        randomSubHarmonic1 = Math.floor(Math.random() * 24) + 1;
                                        randomSubHarmonic2 = Math.floor(Math.random() * 24) + 1;
                                        randomSubHarmonic3 = Math.floor(Math.random() * 24) + 1;
                                        randomSubHarmonic4 = Math.floor(Math.random() * 24) + 1;
                                        freqDivided = true;
                                        subHarmonicGen1.frequency.value = mainOscillator.value / randomSubHarmonic1;
                                        subHarmonicGen2.frequency.value = mainOscillator.value / randomSubHarmonic2;
                                        subHarmonicGen3.frequency.value = mainOscillator.value / randomSubHarmonic3;
                                        subHarmonicGen4.frequency.value = mainOscillator.value / randomSubHarmonic4;
                                        break;
                                    } else if (freqDivided == true && e.data[2] == 0) {
                                        freqDivided = false;
                                        subHarmonicGen1.frequency.value = mainOscillator.value / freqDiv1Bank1.value;
                                        subHarmonicGen2.frequency.value = mainOscillator.value / freqDiv2Bank1.value;
                                        subHarmonicGen3.frequency.value = mainOscillator.value / freqDiv3Bank1.value;
                                        subHarmonicGen4.frequency.value = mainOscillator.value / freqDiv4Bank1.value;
                                        break;
                                    }
                                    break;
                                case 35:
                                    mainOscillatorDetune.value = (e.data[2] * -1);
                                    mainOsc.detune.value = (e.data[2] * -1);
                                    subHarmonicGen1.detune.value = (e.data[2] * -1);
                                    subHarmonicGen2.detune.value = (e.data[2] * -1);
                                    subHarmonicGen3.detune.value = (e.data[2] * -1);
                                    subHarmonicGen4.detune.value = (e.data[2] * -1);
                                    break;
                                case 38:
                                    mainOscillatorDetune.value = (e.data[2]) / 2;
                                    mainOsc.detune.value = (e.data[2]) / 2;
                                    subHarmonicGen1.detune.value = (e.data[2]) / 2;
                                    subHarmonicGen2.detune.value = (e.data[2]) / 2;
                                    subHarmonicGen3.detune.value = (e.data[2]) / 2;
                                    subHarmonicGen4.detune.value = (e.data[2]) / 2;
                                    break;
                                case 41:
                                    sideOscillatorDetune.value = (e.data[2] * -1);
                                    sideOsc.detune.value = (e.data[2] * -1);
                                    break;
                                case 44:
                                    sideOscillatorDetune.value = (e.data[2]) / 2;
                                    sideOsc.detune.value = (e.data[2]) / 2;
                                    break;
                                default:
                                    break;

                            }

                        }
                    )
                } else {
                    console.log('No QuNeo!');
                };



                // // // // MIDI Channel 2. Korg NanoKontrol 2
                // inputKorg.addListener('controlchange', 'all',
                //     function (e) {
                //         switch (e.data[1]) {
                //             case 32:
                //                 if (e.data[2] == 127 && freqDiv1Bank1.value < 24) {
                //                     freqDiv1Bank1.value = String(parseInt(freqDiv1Bank1.value) + 1);
                //                     break;
                //                 }
                //                 break;
                //             case 33:
                //                 if (e.data[2] == 127 && freqDiv2Bank1.value < 24) {
                //                     freqDiv2Bank1.value = String(parseInt(freqDiv2Bank1.value) + 1);
                //                     break;
                //                 }
                //                 break;
                //             case 34:
                //                 if (e.data[2] == 127 && freqDiv3Bank1.value < 24) {
                //                     freqDiv3Bank1.value = String(parseInt(freqDiv3Bank1.value) + 1);
                //                     break;
                //                 }
                //                 break;
                //             case 35:
                //                 if (e.data[2] == 127 && freqDiv4Bank1.value < 24) {
                //                     freqDiv4Bank1.value = String(parseInt(freqDiv4Bank1.value) + 1);
                //                     break;
                //                 }
                //                 break;
                //             case 36:
                //                 if (e.data[2] == 127 && freqDiv1Bank2.value < 24) {
                //                     freqDiv1Bank2.value = String(parseInt(freqDiv1Bank2.value) + 1);
                //                     break;
                //                 }
                //                 break;
                //             case 37:
                //                 if (e.data[2] == 127 && freqDiv2Bank2.value < 24) {
                //                     freqDiv2Bank2.value = String(parseInt(freqDiv2Bank2.value) + 1);
                //                     break;
                //                 }
                //                 break;
                //             case 38:
                //                 if (e.data[2] == 127 && freqDiv3Bank2.value < 24) {
                //                     freqDiv3Bank2.value = String(parseInt(freqDiv3Bank2.value) + 1);
                //                     break;
                //                 }
                //                 break;
                //             case 39:
                //                 if (e.data[2] == 127 && freqDiv4Bank2.value < 24) {
                //                     freqDiv4Bank2.value = String(parseInt(freqDiv4Bank2.value) + 1);
                //                     break;
                //                 }
                //                 break;
                //             case 48:
                //                 if (e.data[2] == 127 && freqDiv1Bank1.value > 1) {
                //                     freqDiv1Bank1.value = String(parseInt(freqDiv1Bank1.value) - 1);
                //                     break;
                //                 }
                //                 break;
                //             case 49:
                //                 if (e.data[2] == 127 && freqDiv2Bank1.value > 1) {
                //                     freqDiv2Bank1.value = String(parseInt(freqDiv2Bank1.value) - 1);
                //                     break;
                //                 }
                //                 break;
                //             case 50:
                //                 if (e.data[2] == 127 && freqDiv3Bank1.value > 1) {
                //                     freqDiv3Bank1.value = String(parseInt(freqDiv3Bank1.value) - 1);
                //                     break;
                //                 }
                //                 break;
                //             case 51:
                //                 if (e.data[2] == 127 && freqDiv4Bank1.value > 1) {
                //                     freqDiv4Bank1.value = String(parseInt(freqDiv4Bank1.value) - 1);
                //                     break;
                //                 }
                //                 break;
                //             case 52:
                //                 if (e.data[2] == 127 && freqDiv1Bank2.value > 1) {
                //                     freqDiv1Bank2.value = String(parseInt(freqDiv1Bank2.value) - 1);
                //                     break;
                //                 }
                //                 break;
                //             case 53:
                //                 if (e.data[2] == 127 && freqDiv2Bank2.value > 1) {
                //                     freqDiv2Bank2.value = String(parseInt(freqDiv2Bank2.value) - 1);
                //                     break;
                //                 }
                //                 break;
                //             case 54:
                //                 if (e.data[2] == 127 && freqDiv3Bank2.value > 1) {
                //                     freqDiv3Bank2.value = String(parseInt(freqDiv3Bank2.value) - 1);
                //                     break;
                //                 }
                //                 break;
                //             case 55:
                //                 if (e.data[2] == 127 && freqDiv4Bank2.value > 1) {
                //                     freqDiv4Bank2.value = String(parseInt(freqDiv4Bank2.value) - 1);
                //                     break;
                //                 }
                //                 break;
                //             case 64:
                //                 if (e.data[2] == 127) {
                //                     formant1Type.checked = true;
                //                     formantFilter1.type = 'lowpass';
                //                     break;
                //                 } else {
                //                     formant1Type.checked = false;
                //                     formantFilter1.type = 'bandpass';
                //                     break;
                //                 }
                //                 break;
                //             case 65:
                //                 if (e.data[2] == 127) {
                //                     formant2Type.checked = true;
                //                     formantFilter2.type = 'lowpass';
                //                     break;
                //                 } else {
                //                     formant2Type.checked = false;
                //                     formantFilter2.type = 'bandpass';
                //                     break;
                //                 }
                //                 break;
                //             case 66:
                //                 if (e.data[2] == 127) {
                //                     formant3Type.checked = true;
                //                     formantFilter3.type = 'lowpass';
                //                     break;
                //                 } else {
                //                     formant3Type.checked = false;
                //                     formantFilter3.type = 'bandpass';
                //                     break;
                //                 }
                //                 break;
                //             case 67:
                //                 if (e.data[2] == 127) {
                //                     formant4Type.checked = true;
                //                     formantFilter4.type = 'lowpass';
                //                     break;
                //                 } else {
                //                     formant4Type.checked = false;
                //                     formantFilter4.type = 'bandpass';
                //                     break;
                //                 }
                //                 break;
                //             case 0:
                //                 formant1Q.value = e.data[2] * 10;
                //                 formantFilter1.Q.value = logSlider(e.data[2] * 10, 1, 10);
                //                 break;
                //             case 1:
                //                 formant2Q.value = e.data[2] * 10;
                //                 formantFilter2.Q.value = logSlider(e.data[2] * 10, 1, 10);
                //                 break;
                //             case 2:
                //                 formant3Q.value = e.data[2] * 10;
                //                 formantFilter3.Q.value = logSlider(e.data[2] * 10, 1, 10);
                //                 break;
                //             case 3:
                //                 formant4Q.value = e.data[2] * 10;
                //                 formantFilter4.Q.value = logSlider(e.data[2] * 10, 1, 10);
                //                 break;
                //             case 4:
                //                 mixerSliderCh1.value = e.data[2] - 27;
                //                 mixerCh1.gain.value = e.data[2] / 100.0;
                //                 break;
                //             case 5:
                //                 mixerSliderCh2.value = e.data[2] - 27;
                //                 mixerCh2.gain.value = e.data[2] / 100.0;
                //                 break;
                //             case 6:
                //                 mixerSliderCh3.value = e.data[2] - 27;
                //                 mixerCh3.gain.value = e.data[2] / 100.0;
                //                 break;
                //             case 7:
                //                 mixerSliderCh4.value = e.data[2] - 27;
                //                 mixerCh4.gain.value = e.data[2] / 100.0;
                //                 break;
                //             case 16:
                //                 mainOscillatorDetune.value = e.data[2] - 63;
                //                 mainOsc.detune.value = e.data[2] - 63;
                //                 subHarmonicGen1.detune.value = e.data[2] - 63;
                //                 subHarmonicGen2.detune.value = e.data[2] - 63;
                //                 subHarmonicGen3.detune.value = e.data[2] - 63;
                //                 subHarmonicGen4.detune.value = e.data[2] - 63;
                //                 break;
                //             case 17:
                //                 sideOscillatorDetune.value = e.data[2] - 63;
                //                 sideOsc.detune.value = e.data[2] - 63;
                //                 break;
                //             case 18:
                //                 noiseFilter.value = e.data[2] * 10;
                //                 noiseSourceFilter.frequency.value = logSlider(e.data[2] * 10, 20, 20000);
                //                 break;
                //             case 21:
                //                 setElementXPosition.value = (e.data[2] - 63);
                //                 xPos = (e.data[2] - 63) / 100.0;
                //                 yPos = yPos
                //                 zPos = zPos;
                //                 resonanceSource.setPosition(xPos, yPos, zPos);
                //                 break;
                //             case 22:
                //                 setElementYPosition.value = (e.data[2] - 63);
                //                 xPos = xPos;
                //                 yPos = (e.data[2] - 63) / 100.0;
                //                 zPos = zPos;
                //                 resonanceSource.setPosition(xPos, yPos, zPos);
                //                 break;
                //             case 23:
                //                 setElementZPosition.value = (e.data[2] - 63);
                //                 xPos = xPos;
                //                 yPos = yPos
                //                 zPos = (e.data[2] - 63) / 100.0;
                //                 resonanceSource.setPosition(xPos, yPos, zPos);
                //                 break;
                //             default:
                //                 break;
                //         }

                //     });
            }
        })
    }
}



// SETUP/CONFIG

// Grab Devices
inputDeviceArray = [];
inputDeviceId = null;





function setAudioValues() {
    sample_rate = Number(document.getElementById('sample-rate').value);
    bit_depth = Number(document.getElementById('bit-depth').value);
    buffer_size = Number(document.getElementById('buffer-size').value);


    startButton.disabled = false;
    console.log(sample_rate, bit_depth, buffer_size)
}

const deviceSelect = document.getElementById('device-inputs');
deviceSelect.style.display = 'none'

function getDevices() {
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
        devices.forEach(function (device) {
            deviceSelect.options[deviceSelect.options.length] = new Option(device.label);
            inputDeviceArray.push(device.deviceId);

            // console.log(device.kind + ": " + device.label +
            //   " id = " + device.deviceId);
        });

        function chooseDevice() {
            return inputDeviceId = inputDeviceArray[deviceSelect.selectedIndex];
        }

        deviceSelect.addEventListener('change', chooseDevice)
    })
}
window.onload = getDevices();

// function bootDevices() {
//   navigator.mediaDevices.getUserMedia({
//     audio: {
//       sampleRate: sample_rate,
//       sampleSize: bit_depth,
//       latency: 0,
//       deviceId: inputDeviceId,
//       channelCount: 1,
//       echoCancellation: false,
//       noiseSuppression: false,
//       autoGainControl: false
//     },
//     video: false
//   }).then(handleSuccess);
// }

startVideoButton.onclick = function () {
    // if (dc.readyState == 'connecting') {
    //   startButton.disabled = false;
    //   console.log(dc.readyState)
    // } else {
    startVideoButton.disabled = true;
    // setAudioButton.disabled = true;
    navigator.mediaDevices.getUserMedia({
        audio: {
            sampleRate: sample_rate,
            sampleSize: bit_depth,
            latency: 0,
            deviceId: inputDeviceId,
            channelCount: 2,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
        },
        video: {
            height: 320,
            width: 240
        }
        // video: false
    }).then(handleVideo);
}



////////////////////////////


// Coordinates the handshake
socket.on('offerTransport-1', function (offerVal) {
    offer.value = offerVal;
    // setAudioButton.disabled = false;  
    makeAnswer();
})

async function makeAnswer() {
    document.getElementById('message-div').innerText = 'Connecting...';
    // setTimeout(function() {startButton.disabled = false}, 2000);
    // setTimeout(function() {receiveButton.disabled = false}, 2000);  
    if (pc.signalingState != "stable") return;
    offer.disabled = true;
    await pc.setRemoteDescription({
        type: "offer",
        sdp: offer.value
    });
    await pc.setLocalDescription(await pc.createAnswer());
    pc.onicecandidate = ({
        candidate
    }) => {
        if (candidate) return;

        // Change compression tactics here    
        pc.localDescription.sdp = pc.localDescription.sdp.replace(/a=fmtp:111 minptime=10/, 'a=fmtp:111 minptime=3; stereo=0');
        // pc.localDescription.sdp = pc.localDescription.sdp.replace(/a=mid:0\r\n/g, 'a=mid:audio\r\nb=AS:510\r\n');    
        pc.localDescription.sdp = pc.localDescription.sdp + 'a=ptime:3\r\na=maxptime:20\r\n';

        answer.focus();
        answer.value = pc.localDescription.sdp;
        answer.select();
        solidifyAnswer();
        document.getElementById('message-div').innerText = 'Connected!';
        socket.emit('answerTransport-1', answer.value);
    };
};

function solidifyAnswer() {
    if (pc.signalingState != "have-local-offer") return;
    answer.disabled = true;
    pc.setRemoteDescription({
        type: "answer",
        sdp: answer.value
    });
};