import * as wss from "./wss.js";

export const sendPreOffer = (calleePersonalCode, type) => {
    const data = {
        type,
        calleePersonalCode,
    };

    wss.sendPreOffer(data);
};

export const handlePreOffer = (data) => {
    console.log(data);
};