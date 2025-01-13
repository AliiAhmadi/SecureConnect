import * as store from "./store.js";
import * as ui from "./ui.js";
import * as rtc from "./webRTCHandler.js";
import * as constants from "./constants.js";

let socketIO = null;

export const registerSocketEvents = (socket) => {
    socketIO = socket;
    
    socket.on("connect", () => {
        store.setSocketId(socket.id);
        ui.updatePersonalCode(socket.id);
    });

    socket.on("pre-offer", (data) => {
        rtc.handlePreOffer(data);
    });
    
    socket.on("pre-offer-answer", (data) => {
        rtc.handlePreOfferAnswer(data);
    });

    socket.on("user-hanged-up", () => {
        rtc.handleConnectedUserHangedUp();
    });

    socket.on("webRTC-signaling", (data) => {
        switch (data.type) {
            case constants.webRTCSignaling.OFFER:
                rtc.handleWebRTCOffer(data);
                break;
            case constants.webRTCSignaling.ANSWER:
                rtc.handleWebRTCAnswer(data);
                break;
            case constants.webRTCSignaling.ICE_CANDIDATE:
                rtc.handleWebRTCCandidate(data);
                break;
            default:
                return;
        }
    });
};

export const sendPreOffer = (data) => {
    socketIO.emit("pre-offer", data);
};

export const sendPreOfferAnswer = (data) => {
    socketIO.emit("pre-offer-answer", data);
};


export const sendDataUsingWebRTCSignaling = (data) => {
    socketIO.emit("webRTC-signaling", data);
};

export const sendUserHangUp = (data) => {
    socketIO.emit("user-hanged-up", data);
};