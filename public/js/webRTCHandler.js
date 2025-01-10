import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";

let connectedUserDetails;

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


