import express from "express";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());


const PORT = 8080;

// This is the dictionary that maps the userKey with the connection.
const connectionMap = {}

async function connectToInstances() {
  // This function is first executed when the gateway is created. It creates all the ws connections.
  // TODO: add logic
}

await connectToInstances();


app.get("/connectGameServer", async (req, res)=> {
  const data = req.body;
  const url = `ws://game-server-${data.roomNo}`;
  const ws = new WebSocket(url);

  ws.onopen((e) => {
    connectionMap[data.roomNo] = ws;
  })

});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({
  server
});

wss.on("connection", (socket) => {
  console.log("Client connected");

  socket.send(JSON.stringify({
    type: "connected",
    message: "WebSocket connection established"
  }));

  socket.on("message", (data) => {
    /* When I receive a message, I have to check the game Number that is sent thrugh the request and search it on the connectionMap.
       If it's not there, then the game server doesn't exist.
       If it's there, but the connection doesn't work, it has to be restarted.
    */
    
    const message = JSON.parse(data.toString());


  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});