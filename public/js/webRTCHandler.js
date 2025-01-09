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
};

const rejectCallHandler = () => {
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};



const sendPreOfferAnswer = (preOfferAnswer) => {
    const data = {
        callerSocketId: connectedUserDetails.socketId,
        preOfferAnswer: preOfferAnswer,
    };
    
    wss.sendPreOfferAnswer(data);
};


const callingDialogRejectCallHandler = () => {
    console.log("rejecting the call");
};
