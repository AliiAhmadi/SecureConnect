import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";

let connectedUserDetails;
let peerConnection;

const defaultConstraints = {
    audio: true,
    video: true,
};

const configuration = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:13902",
        },
    ], 
};

const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
        if(event.candidate) {
            // to other side
            console.log("okkkk");
        }
    };

    peerConnection.onconnectionstatechange = (event) => {
        if(peerConnection.connectionState === "connected") {
            console.log("connected to other peer");
        }
    };


    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);


    peerConnection.ontrack = (event) => {
        remoteStream.addTrack(event.track);
    };

    if(connectedUserDetails.type === constants.callType.VIDEO_PERSONAL_CODE) {
        const localStream = store.getState().localStream;


        for(const track of localStream.getTracks()) {
            peerConnection.addTrack(track, localStream);
        }
    }
};

export const getLocalPreview = () => {
    navigator.mediaDevices.getUserMedia(defaultConstraints)
        .then((stream) => {
            ui.updateLocalVideo(stream);
            store.setLocalStream(stream);
        }).catch((err) => {
            console.log("access error");
        });
};

export const sendPreOffer = (calleePersonalCode, type) => {
    connectedUserDetails = {
        type,
        socketId: calleePersonalCode,
    };

    if(type === constants.callType.CHAT_PERSONAL_CODE || type === constants.callType.VIDEO_PERSONAL_CODE) {
        const data = {
            type,
            calleePersonalCode,
        };
        ui.showCallingDialog(callingDialogRejectCallHandler);
        wss.sendPreOffer(data);
    }
};

export const handlePreOffer = (data) => {
    const { type, callerSocketId } = data;

    connectedUserDetails = {
        socketId: callerSocketId,
        type,
    };

    if(
        type === constants.callType.CHAT_PERSONAL_CODE ||
        type === constants.callType.VIDEO_PERSONAL_CODE
    ) {
        ui.showIncomingCallDialog(type, acceptCallHandler, rejectCallHandler);
    }
};


const acceptCallHandler = () => {
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.type);
};

const rejectCallHandler = () => {
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};



const sendPreOfferAnswer = (preOfferAnswer) => {
    const data = {
        callerSocketId: connectedUserDetails.socketId,
        preOfferAnswer: preOfferAnswer,
    };
    
    ui.removeAllDialogs();
    wss.sendPreOfferAnswer(data);
};


export const handlePreOfferAnswer = (data) => {
    const { preOfferAnswer } = data;

    ui.removeAllDialogs();

    if(preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        // show not found
        ui.showInfoDialog(preOfferAnswer);
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        // show can not connect
        ui.showInfoDialog(preOfferAnswer);
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        // show call rejected
        ui.showInfoDialog(preOfferAnswer);
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
        // send webRTC offer
        ui.showCallElements(connectedUserDetails.type);
    }
};

const callingDialogRejectCallHandler = () => {
    console.log("rejecting the call");
};


