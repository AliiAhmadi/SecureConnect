import * as store from "./store.js";
const socket = io("/");

socket.on("connect", () => {
    console.log("connection to wss was succesfull.");
    store.setSocketId(socket.id);
});