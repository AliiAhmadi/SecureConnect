import * as wss from "./wss.js";
import * as rtc from "./webRTCHandler.js";
import * as ui from "./ui.js";

let lurkerCallType;

export const changeLurkerConnectionStatus = (status) => {
    const data = {status};
    wss.changeLurkerConnectionStatus(data);
};

export const getLurkerSocketIdAndConnect = (callType) => {
    lurkerCallType = callType;
    wss.getLurkerSocketId();
};

export const connectWithLurker = (data) => {
    // console.log(data);

    
    if(data.randomLurkerSocketId) {
        rtc.sendPreOffer(data.randomLurkerSocketId, lurkerCallType);
    } else {
        // any user not available for call
        ui.showNotLurkerAvailableDialog();
    }
};