import * as constants from "./constants.js";
import * as elements from "./elements.js";

export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById("personal_code_paragraph");
    personalCodeParagraph.innerHTML = personalCode;
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