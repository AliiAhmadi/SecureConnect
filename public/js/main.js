import * as store from "./store.js";
import * as wss from "./wss.js";

const socket = io("/");
wss.registerSocketEvents(socket);


const personalCodeCopyButton = document.getElementById("personal_code_copy_button");
personalCodeCopyButton.addEventListener("click", (e) => {
    const code = store.getState().socketId;
    navigator.clipboard && navigator.clipboard.writeText(code);
});


const personalCodeChatButton = document.getElementById("personal_code_chat_button");
const personalCodeVideoButton = document.getElementById("personal_code_video_button");

personalCodeChatButton.addEventListener("click", (e) => {
    console.log("chat started");
});

personalCodeVideoButton.addEventListener("click", (e) => {
    console.log("video started");
});