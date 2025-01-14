const express = require("express");
const https = require("https");
const fs = require("fs");

const options = {
	key: fs.readFileSync('/etc/ssl/self-signed/server.key'),
	cert: fs.readFileSync('/etc/ssl/self-signed/server.crt'),
};

const app = express();
const server = https.createServer(options, app);
const io = require("socket.io")(server);


app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

let connectedPeers = [];
let connectedPeersLurkers = [];

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

    socket.on("webRTC-signaling", (data) => {
        const { connectedUserSocketId } = data;
        const connectedPeer = connectedPeers.find((peerSocketId) => {
            return peerSocketId === connectedUserSocketId;
        });

        if(connectedPeer) {
            io.to(connectedUserSocketId).emit("webRTC-signaling", data);
        }
    });

    socket.on("user-hanged-up", (data) => {
        const { connectedUserSocketId } = data;

        const connectedPeer = connectedPeers.find((peerSocketId) => {
            return peerSocketId === connectedUserSocketId;
        });

        if(connectedPeer) {
            io.to(connectedUserSocketId).emit("user-hanged-up");
        }

    });

    socket.on("lurker-connection-status", (data) => {
        const { status } = data;

        if(status) {
            connectedPeersLurkers.push(socket.id);
        } else {
            const newConnectedPeersLurkers = connectedPeersLurkers.filter((peerSocketId) => {
                return peerSocketId !== socket.id;
            });

            connectedPeersLurkers = newConnectedPeersLurkers;
        }
    });

    socket.on("get-lurker-socket-id", () => {
        let randomLurkerSocketId;
        const filteredConnectedPeersLurkers = connectedPeersLurkers.filter((peerSocketId) => {
            return peerSocketId !== socket.id;
        });

        if(filteredConnectedPeersLurkers.length > 0) {
            randomLurkerSocketId = filteredConnectedPeersLurkers[Math.floor(Math.random() * filteredConnectedPeersLurkers.length)];
        } else {
            randomLurkerSocketId = null;
        }

        const data = {
            randomLurkerSocketId,
        };

        io.to(socket.id).emit("lurker-socket-id", data);
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

        const newConnectedPeersLurkers = connectedPeersLurkers.filter((peerSocketId) => {
            return peerSocketId !== socket.id;
        });
        connectedPeersLurkers = newConnectedPeersLurkers;
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});
