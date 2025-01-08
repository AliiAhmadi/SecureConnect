const socket = io("/");

socket.on("connect", () => {
    console.log("connection to wss was succesfull.");
    console.log(socket.id);
});