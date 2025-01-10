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
            wss.sendDataUsingWebRTCSignaling({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRTCSignaling.ICE_CANDIDATE,
                candidate: event.candidate,
            });
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
    createPeerConnection();
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
    console.log("webrtc candidate handling");
    try {
        await peerConnection.addIceCandidate(data.candidate);
    }catch(err) {
        console.log("error in handling ice candidate", err);
    }
};

const callingDialogRejectCallHandler = () => {
    console.log("rejecting the call");
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