import * as constants from "./constants.js";
import * as elements from "./elements.js";
import * as store from "./store.js";

export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById("personal_code_paragraph");
    personalCodeParagraph.innerHTML = personalCode;
};

export const updateLocalVideo = (stream) => {
    const localVideo = document.getElementById("local_video");
    localVideo.srcObject = stream;

    localVideo.addEventListener("loadedmetadata", () => {
        localVideo.play();
    });
};

export const updateRemoteVideo = (stream) => {
    const remoteVideo = document.getElementById("remote_video");
    remoteVideo.srcObject = stream;
};

export const showIncomingCallDialog = (callType, acceptCallHandler, rejectCallHandler) => {
    const callTypeInfo = (callType === constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video");

    const incomingCallDialog = elements.getIncommingCallDialog(callTypeInfo, acceptCallHandler, rejectCallHandler);

    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((d) => d.remove());
    dialog.appendChild(incomingCallDialog);
};

export const showCallingDialog = (rejectCallHandler) => {
    const callingDialog = elements.getCallingDialog(rejectCallHandler);

    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((d) => d.remove());

    dialog.appendChild(callingDialog);
};

export const removeAllDialogs = () => {
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((d) => d.remove());
};

export const showInfoDialog = (preOfferAnswer) => {
    let infoDialog = null;

    if(preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        infoDialog = elements.getInfoDialog(
            "User not found",
            "Please check personal code"
        );
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        infoDialog = elements.getInfoDialog(
            "Call rejected",
            "Rejected by User"
        );
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        infoDialog = elements.getInfoDialog(
            "Call is not possible",
            "User is busy. Try later."
        );
    }

    if(infoDialog) {
        const dialog = document.getElementById("dialog");
        dialog.appendChild(infoDialog);

        setTimeout(() => {
            removeAllDialogs();
        }, [4000]);
    }
};

const enableDashboard = () => {
    const dashboardBlocker = document.getElementById("dashboard_blur");
    if(!dashboardBlocker.classList.contains("display_none")) {
        dashboardBlocker.classList.add("display_none");
    }
};

const disableDashboard = () => {
    const dashboardBlocker = document.getElementById("dashboard_blur");
    if(dashboardBlocker.classList.contains("display_none")) {
        dashboardBlocker.classList.remove("display_none");
    }
};

const hideElement = (element) => {
    if(!element.classList.contains("display_none")) {
        element.classList.add("display_none");
    }
};

const showElement = (element) => {
    if(element.classList.contains("display_none")) {
        element.classList.remove("display_none");
    }
};

const showChatCallElements = () => {
    const finishConnectionChatButtonContainer = document.getElementById("finish_chat_button_container");
    showElement(finishConnectionChatButtonContainer);
    
    const newMessageInput = document.getElementById("new_message");
    showElement(newMessageInput);
    disableDashboard();
};


const showVideoCallElements = () => {
    const callButtons = document.getElementById("call_buttons");
    showElement(callButtons);

    const placeholder = document.getElementById("video_placeholder");
    hideElement(placeholder);

    const remoteVideo = document.getElementById("remote_video");
    showElement(remoteVideo);

    const newMessageInput = document.getElementById("new_message");
    showElement(newMessageInput);
    disableDashboard();
};

export const showCallElements = (callType) => {
    if(callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.CHAT_LURKERS) {
        showChatCallElements();
    }

    if(callType === constants.callType.VIDEO_PERSONAL_CODE || callType === constants.callType.VIDEO_LURKERS) {
        showVideoCallElements();
    }
};

const micOnImageSrc = "./utils/images/mic.png";
const micOffImageSrc = "./utils/images/micOff.png";

export const updateMicButton = (micEnabled) => {
    const micButtonImage = document.getElementById("mic_button_image");
    micButtonImage.src = micEnabled ? micOffImageSrc : micOnImageSrc;
};

const cameraOnImageSrc = "./utils/images/camera.png";
const cameraOffImageSrc = "./utils/images/cameraOff.png";

export const updateCameraButton = (cameraEnabled) => {
    const cameraButtonImage = document.getElementById("camera_button_image");
    cameraButtonImage.src = cameraEnabled ? cameraOffImageSrc : cameraOnImageSrc;
};

export const appendMessage = (message, right = false) => {
    const messagesContainer = document.getElementById("messages_container");
    const messageElement = right
      ? elements.getRightMessage(message)
      : elements.getLeftMessage(message);
    messagesContainer.appendChild(messageElement);
};

export const clearMessenger = () => {
    const messagesContainer = document.getElementById("messages_container");
    messagesContainer.querySelectorAll("*").forEach((n) => n.remove());
};

export const showRecordingPanel = () => {
    const recordingButtons = document.getElementById("video_recording_buttons");
    showElement(recordingButtons);
  
    const startRecordingButton = document.getElementById(
      "start_recording_button"
    );
    hideElement(startRecordingButton);
};

export const resetRecordingButtons = () => {
    const startRecordingButton = document.getElementById(
      "start_recording_button"
    );
    const recordingButtons = document.getElementById("video_recording_buttons");
  
    hideElement(recordingButtons);
    showElement(startRecordingButton);
};

export const switchRecordingButtons = (switchR = false) =>{
    const resumeButton = document.getElementById("resume_recording_button");
    const pauseButton = document.getElementById("pause_recording_button");

    if(switchR) {
        hideElement(pauseButton);
        showElement(resumeButton);
    } else {
        hideElement(resumeButton);
        showElement(pauseButton);
    }
};

export const updateUiAfterHangUp = (type) => {
    enableDashboard();

    if(
            type === constants.callType.VIDEO_PERSONAL_CODE ||
            type === constants.callType.VIDEO_LURKERS
    ) {
        const callButtons = document.getElementById("call_buttons");

        hideElement(callButtons);
    } else {
        const chatCallButtons = document.getElementById("finish_chat_button_container");
        hideElement(chatCallButtons);
    }


    const newMessageInput = document.getElementById("new_message");
    hideElement(newMessageInput);
    clearMessenger();

    updateMicButton(false);
    updateCameraButton(false);

    const remoteVideo = document.getElementById("remote_video");
    hideElement(remoteVideo);


    const placehodler = document.getElementById("video_placeholder");
    showElement(placehodler);

    removeAllDialogs();
};

export const showVideoCallButtons = () => {
    const personalCodeVideoButton = document.getElementById("personal_code_video_button");
    const lurkerVideoButton = document.getElementById("lurker_video_button");

    showElement(personalCodeVideoButton);
    showElement(lurkerVideoButton);
};

export const updateLurkerCheckBox = (allowConnections) => {
    const checkboxCheckImage = document.getElementById("allow_lurkers_checkbox_image");

    allowConnections ? showElement(checkboxCheckImage) : hideElement(checkboxCheckImage);
};

export const showNotLurkerAvailableDialog = () => {
    const infoDialog = elements.getInfoDialog("No lurker available", "please try again later...");

    if(infoDialog) {
        const dialog = document.getElementById("dialog");
        dialog.appendChild(infoDialog);

        setTimeout(() => {
            removeAllDialogs();
        }, [4000]);
    }
};