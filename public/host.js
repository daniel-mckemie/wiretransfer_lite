// Good info here:
// https://webrtc.github.io/samples/src/content/peerconnection/webaudio-input/
// Websocket for offer/answer transfer
const socket = io.connect('/');

var sample_rate, bit_depth, buffer_size, inputDeviceArray, inputDeviceId

// Functional defs
const startVideoButton = document.getElementById('start-video-button');
const offerButton = document.getElementById('offer-button');

const infoDiv = document.getElementById('info');


// http://rtoy.github.io/webaudio-hacks/tests/osc.html
// Audio variables
sample_rate = 44100;
bit_depth = 16;
buffer_size = 256;

// ICE SERVERS FOR P2P CONNECTION
// https://temasys.io/guides/developers/webrtc-ice-sorcery/
// https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
const config = {
    iceServers: [{
        // This will have to be configured to a server near you.
        // Or wire it to the local network re: the WebRTC protocol
            urls: 'stun:stun.l.google.com:19302'
        },
        //
        // {
        //   urls: 'turn:turn.bridgr.io:3478?transport=udp',
        //   credential: '12345',
        //   username: 'daniel'
        // },
        //
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
    latencyHint: 'interactive', // Lower latency option
    channelCount: 2
});



let source;

const otherVideoStream = document.getElementById('otherVideoTag')
const handleVideo = function (streamVid) {
    
    
    source = context.createMediaStreamSource(streamVid);
    
    // source.connect(context.destination);

    document.getElementById('base-latency-div').innerText = 'Base Latency (in seconds): ' + context.baseLatency;

    pc.addTrack(streamVid.getAudioTracks()[0], streamVid);
    pc.addTrack(streamVid.getVideoTracks()[0], streamVid); // This shows video. The capture is automatic.
}
let counter = 0;

// This is where you will wire the audio stream to the output.  This currently isn't working on my setup but I can keep picking at it later.
// You may have this set up a different way, and this was originally optimized for streaming the browser as an audio source, not mic input.
pc.ontrack = e => {
    counter++;
    // Prevent double load
    if (counter == 2) {

        e.track.onunmute = () => {
            console.log(e);                        
            otherVideoStream.srcObject = e.streams[0];            
            
        }
    }

                
    
}


// This taps into the computer's audio devices and lists them in a menu.
// By default, the device enabled in Audio/MIDI setup is what the browser will use.

// Grab Devices
inputDeviceArray = [];
inputDeviceId = null;

function setAudioValues() {
    sample_rate = Number(document.getElementById('sample-rate').value);
    bit_depth = Number(document.getElementById('bit-depth').value);
    buffer_size = Number(document.getElementById('buffer-size').value);


    startButton.disabled = false
    console.log(sample_rate, bit_depth, buffer_size)
}

// Hardware Information
const deviceSelect = document.getElementById('device-inputs');
deviceSelect.style.display = 'none'
// startButton.disabled = true;
// receiveButton.disabled = true;


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


startVideoButton.onclick = function () {
    // if (dc.readyState == 'connecting') {
    //   startButton.disabled = false;
    //   console.log(dc.readyState)
    // } else {    
    startVideoButton.disabled = true;
    setTimeout(() => {
        offerButton.disabled = false;
    }, 2000);
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


// The offer is constructed and sent to the guest, constructed there, and sent back to the host.
// This all uses asynchronous JS and WebSockets

// URL For configuring offer/answer string
// https://webrtcforthecurious.com/docs/02-signaling/
offerButton.disabled = true;
// Coordinates the handshake
offerButton.onclick = async function createOffer() {
    document.getElementById('message-div').innerText = 'Connecting...';

    await pc.setLocalDescription(await pc.createOffer());
    pc.onicecandidate = ({
        candidate
    }) => {
        if (candidate) return;

        // Change compression settings here
        // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/WebRTC_codecs
        pc.localDescription.sdp = pc.localDescription.sdp.replace(/a=fmtp:111 minptime=10/, 'a=fmtp:111 minptime=3; stereo=0');
        pc.localDescription.sdp = pc.localDescription.sdp + 'a=ptime:3\r\na=maxptime:20\r\n';



        offer.value = pc.localDescription.sdp;
        socket.emit('offerTransport-1', offer.value);
        offer.select();
        answer.placeholder = "Paste answer here";
        solidfyOffer()
    };
}

async function solidfyOffer() {
    if (pc.signalingState != "stable") return;
    button.disabled = offer.disabled = true;
    await pc.setRemoteDescription({
        type: "offer",
        sdp: offer.value
    });

    await pc.setLocalDescription(await pc.createAnswer());
    pc.onicecandidate = ({
        candidate
    }) => {
        if (candidate) return;
        pc.localDescription.sdp = pc.localDescription.sdp.replace(/a=fmtp:111 minptime=10/, 'a=fmtp:111 minptime=3; stereo=0; ');
        pc.localDescription.sdp = pc.localDescription.sdp + 'a=ptime:3\r\na=maxptime:20\r\n';
        answer.focus();
        answer.value = pc.localDescription.sdp;
        answer.select();
    };
};


socket.on('answerTransport-1', function (answerVal) {
    answer.value = answerVal;
    // setAudioButton.disabled = false;
    solidfyAnswer();
})

function solidfyAnswer() {
    if (pc.signalingState != "have-local-offer") return;
    answer.disabled = true;
    // console.log(answer.value)
    pc.setRemoteDescription({
        type: "answer",
        sdp: answer.value
    });
    document.getElementById('message-div').innerText = 'Connected!';
};