const express = require("express");
const http = require("http");
const cors = require("cors");
const setupStream = require("./routes/stream");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
setupStream(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`NodeSight backend running on port ${PORT}`));
