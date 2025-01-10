import * as store from "./store.js";
import * as wss from "./wss.js";
import * as rtc from "./webRTCHandler.js";
import * as constant from "./constants.js";

const socket = io("/");
wss.registerSocketEvents(socket);

rtc.getLocalPreview();

const personalCodeCopyButton = document.getElementById("personal_code_copy_button");
personalCodeCopyButton.addEventListener("click", (e) => {
    const code = store.getState().socketId;
    navigator.clipboard && navigator.clipboard.writeText(code);
});


const personalCodeChatButton = document.getElementById("personal_code_chat_button");
const personalCodeVideoButton = document.getElementById("personal_code_video_button");

personalCodeChatButton.addEventListener("click", (e) => {

    const calleePersonalCode = document.getElementById("personal_code_input").value;
    const type = constant.callType.CHAT_PERSONAL_CODE;
    rtc.sendPreOffer(calleePersonalCode, type);
});

personalCodeVideoButton.addEventListener("click", (e) => {

    const calleePersonalCode = document.getElementById("personal_code_input").value;
    const type = constant.callType.VIDEO_PERSONAL_CODE;
    rtc.sendPreOffer(calleePersonalCode, type);
});
