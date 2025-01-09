import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";

let connectedUserDetails;

export const sendPreOffer = (calleePersonalCode, type) => {
    const data = {
        type,
        calleePersonalCode,
    };

    wss.sendPreOffer(data);
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
    console.log("call accepted");
};

const rejectCallHandler = () => {
    console.log("call rejected");
};