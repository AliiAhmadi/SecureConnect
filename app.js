const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);


app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

let connectedPeers = [];

io.on("connection", (socket) => {
    connectedPeers.push(socket.id);

    socket.on("pre-offer-answer", (data) => {
        const connectedPeer = connectedPeers.find((peerSocketId) => {
            return peerSocketId === data.callerSocketId;
        });

        if(connectedPeer) {
            io.to(data.callerSocketId).emit("pre-offer-answer", data);
        }
    });

    socket.on("pre-offer", (data) => {
        const { calleePersonalCode, type } = data;

        const connectedPeer = connectedPeers.find((peerSocketId) => {
            return peerSocketId === calleePersonalCode;
        });

        if(connectedPeer) {
            const callerData = {
                callerSocketId: socket.id,
                type,
            };

            io.to(calleePersonalCode).emit("pre-offer", callerData);
        } else {
            data = {
                preOfferAnswer: "CALLEE_NOT_FOUND",
            };
            io.to(socket.id).emit("pre-offer-answer", data);
        }
    });

    socket.on("disconnect", () => {
        const newConnectedPeers = connectedPeers.filter((peerSocketId) => {
            return peerSocketId !== socket.id;
        });

        connectedPeers = newConnectedPeers;
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});