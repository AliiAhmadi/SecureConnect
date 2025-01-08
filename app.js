const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);


app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});