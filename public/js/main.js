import * as store from "./store.js";
import * as wss from "./wss.js";
import * as rtc from "./webRTCHandler.js";
import * as constant from "./constants.js";
import * as ui from "./ui.js";

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


const micButton = document.getElementById("mic_button");
micButton.addEventListener("click", (e) => {
    const localStream = store.getState().localStream;
    const micEnabled = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !micEnabled;
    ui.updateMicButton(micEnabled);
});

const cameraButton = document.getElementById("camera_button");
cameraButton.addEventListener("click", (e) => {
    const localStream = store.getState().localStream;
    const cameraEnabled = localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;
    ui.updateCameraButton(cameraEnabled);

});


const switchForScreenSharingButton = document.getElementById("screen_sharing_button");
switchForScreenSharingButton.addEventListener("click", (e) => {
    const screenSharingActive = store.getState().screenSharingActive;
    rtc.switchBetweenCameraAndScreenSharing(screenSharingActive);
});

