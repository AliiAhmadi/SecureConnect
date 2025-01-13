import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";

let connectedUserDetails;
let peerConnection;
let dataChannel;

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
    dataChannel = peerConnection.createDataChannel("chat");

    peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;

        dataChannel.onopen = () => {
        };

        dataChannel.onmessage = (event) => {
            const message = JSON.parse(event.data);
            ui.appendMessage(message);
        };
    };

    peerConnection.onicecandidate = (event) => {
        if(event.candidate) {
            wss.sendDataUsingWebRTCSignaling({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRTCSignaling.ICE_CANDIDATE,
                candidate: event.candidate,
            });
        }
    };

    peerConnection.onconnectionstatechange = (event) => {
        if(peerConnection.connectionState === "connected") {
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

export const sendMessageUsingDataChannel = (message) => {
    const stringifiedMessage = JSON.stringify(message);
    dataChannel.send(stringifiedMessage);
};

export const getLocalPreview = () => {
    navigator.mediaDevices.getUserMedia(defaultConstraints)
        .then((stream) => {
            ui.updateLocalVideo(stream);
            ui.showVideoCallButtons();
            store.setCallState(constants.callState.CALL_AVAILABLE);
            store.setLocalStream(stream);
        }).catch((err) => {
            console.error("Access error");
            console.log(err.name);
            console.log(err.message);
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
        store.setCallState(constants.callState.CALL_UNAVAILABLE);
        wss.sendPreOffer(data);
    }
};

export const handlePreOffer = (data) => {
    const { type, callerSocketId } = data;

    
    if(!checkCallPossiblity()) {
        return sendPreOfferAnswer(constants.preOfferAnswer.CALL_UNAVAILABLE, callerSocketId);
    }
    
    connectedUserDetails = {
        socketId: callerSocketId,
        type,
    };
    
    store.setCallState(constants.callState.CALL_UNAVAILABLE);

    if(
        type === constants.callType.CHAT_PERSONAL_CODE ||
        type === constants.callType.VIDEO_PERSONAL_CODE
    ) {
        ui.showIncomingCallDialog(type, acceptCallHandler, rejectCallHandler);
    }
};


const acceptCallHandler = () => {
    createPeerConnection();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.type);
};

const rejectCallHandler = () => {
    setIncomingCallsAvailable();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};



const sendPreOfferAnswer = (preOfferAnswer, callerSocketId = null) => {
    const callerSocketId2 = callerSocketId ? callerSocketId : connectedUserDetails.socketId;

    const data = {
        callerSocketId: callerSocketId2,
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
        setIncomingCallsAvailable();
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        // show can not connect
        ui.showInfoDialog(preOfferAnswer);
        setIncomingCallsAvailable();
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        // show call rejected
        ui.showInfoDialog(preOfferAnswer);
        setIncomingCallsAvailable();
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
        // send webRTC offer
        ui.showCallElements(connectedUserDetails.type);
        createPeerConnection();
        sendWebRTCOffer();
    }
};

const sendWebRTCOffer = async () => {
    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.OFFER,
        offer: offer,
    });
};

export const handleWebRTCOffer = async (data) => {
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ANSWER,
        answer: answer,
    });
};

export const handleWebRTCAnswer = async (data) => {
    await peerConnection.setRemoteDescription(data.answer);

};

export const handleWebRTCCandidate = async (data) => {
    try {
        await peerConnection.addIceCandidate(data.candidate);
    }catch(err) {
        console.log("error in handling ice candidate", err);
    }
};

const callingDialogRejectCallHandler = () => {
    const data = {
        connectedUserSocketId: connectedUserDetails.socketId,

    };

    closePeerConnectionAndResetState();
    wss.sendUserHangUp(data);
};


let screenSharingStream;

export const switchBetweenCameraAndScreenSharing = async (screenSharingActive) => {
    if(screenSharingActive) {
        const localStream = store.getState().localStream;
        const senders = peerConnection.getSenders();

        const sender = senders.find((sender) => {
            return sender.track.kind === localStream.getVideoTracks()[0].kind;
        });


        if(sender) {
            sender.replaceTrack(localStream.getVideoTracks()[0]);
        }

        store.getState().screenSharingStream.getTracks().forEach((track) => track.stop());

        store.setScreenSharingActive(!screenSharingActive);
        ui.updateLocalVideo(localStream);

    } else {
        try {
            screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
            });

            store.setScreenSharingStream(screenSharingStream);

            const senders = peerConnection.getSenders();
            const sender = senders.find((sender) => {
                return sender.track.kind === screenSharingStream.getVideoTracks()[0].kind;
            });


            if(sender) {
                sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
            }

            store.setScreenSharingActive(!screenSharingActive);

            ui.updateLocalVideo(screenSharingStream);
        } catch(err) {
            console.log("error in switchBetweenCameraAndScreenSharing");
            console.log(err);
        }
    }
};

export const handleHangUp = () => {
    const data = {
        connectedUserSocketId: connectedUserDetails.socketId,
    };

    wss.sendUserHangUp(data);
    closePeerConnectionAndResetState();
};

export const handleConnectedUserHangedUp = () => {
    closePeerConnectionAndResetState();
};

const closePeerConnectionAndResetState = () => {
    if(peerConnection) {
        peerConnection.close();

        peerConnection = null;
    }

    if(
        connectedUserDetails.type === constants.callType.VIDEO_PERSONAL_CODE ||
        connectedUserDetails.type === constants.callType.VIDEO_LURKERS
    ) {
        store.getState().localStream.getVideoTracks()[0].enabled = true;
        store.getState().localStream.getAudioTracks()[0].enabled = true;
    }
    ui.updateUiAfterHangUp(connectedUserDetails.type);
    setIncomingCallsAvailable();
    connectedUserDetails = null;
};


const checkCallPossiblity = (type) => {
    const callState = store.getState().callState;

    if(callState === constants.callState.CALL_AVAILABLE) {
        return true;
    }

    if(
        (type === constants.callType.VIDEO_PERSONAL_CODE ||
        type === constants.callType.VIDEO_LURKERS) &&
        callState === constants.callState.CALL_AVAILABLE_ONLY_CHAT
    ) {
        return false;
    }

    return false;
};


const setIncomingCallsAvailable = () => {
    const localStream = store.getState().localStream;

    if(localStream) {
        store.setCallState(constants.callState.CALL_AVAILABLE);
    } else {
        store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT);
    }
};