// Server Information
const socket = io.connect('/');

var sample_rate, bit_depth, buffer_size, inputDeviceArray, inputDeviceId

// Functional defs
const startVideoButton = document.getElementById('start-video-button');


const infoDiv = document.getElementById('info');


// http://rtoy.github.io/webaudio-hacks/tests/osc.html
// Audio variables
sample_rate = 44100;
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
    latencyHint: 'interactive', // Lower latency
    channelCount: 2
});



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
            
        }                                    
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