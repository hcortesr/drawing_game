import express from "express";
import { WebSocketServer } from "ws";
import { createClient } from "redis";

const app = express();
app.use(express.json());


const PORT = 8080;

// This is the dictionary that maps the userKey with the connection.
// Only the userKey is given. The number of the game server has to be automatically detected. And then the ws is selected.
const connectionMapServer = {};
const connectionMapUsers = {};

const redis = await createClient({
    url: "redis://cache:6379"
});
await redis.connect().then(() => {
    console.log("Sucessfully connected");
});

async function connectToInstances() {
  // This function is first executed when the gateway is created. It creates all the ws connections.
  // TODO: add logic
}

async function redirectToGameserver(req) {
  // This function checks if the user is allowed to enter into the room.
  console.log("qQQqq");

  const x = await redis.get(req.userKey); // This methods returns the room linked to the user
  console.log(x);
    if(x) {
           
      console.log(connectionMapServer);
      console.log(req);
      connectionMapServer[x].send(JSON.stringify(req));
      
    } else {
      console.log("not user");
    }

    return null;
}

async function waitForGameServer(roomNo) {
    const url = `http://game-server-${roomNo}:8080/health`;
    console.log(url);

    for (let i = 0; i < 20; i++) {
        try {
            const response = await fetch(url);

            if (response.ok) {
                console.log("✅ Game server is ready");
                return true;
            }
        } catch (err) {
            console.log(`Game server not ready yet (${i + 1}/20)`);
        }

        await new Promise(resolve => setTimeout(resolve, 200));
    }

    throw new Error("Game server did not become ready");
}

await connectToInstances();

app.post("/connectGameServer", async (req, res)=> {
  console.log("The connectGameServer() methods was used");
  console.log(connectionMapServer);
  console.log(connectionMapUsers);
  const data = req.body;
  const url = `ws://game-server-${data.roomNo}:8080`;
  console.log(url);

  const a = await waitForGameServer(data.roomNo);
  
  if (a);

  // Here the connection to the game server is created.
  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("connectGameServer() The connection was opened");
    connectionMapServer[data.roomNo] = ws;
  }

  ws.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
    console.error(error);
    console.error("message:", error.message);
    console.error("cause:", error.cause);
  };

  // When the connection recieves a request, it has to search the user on "connectionMapUsers".
  // This is assuming the user already has a key and is stored on the dictionary.


  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("req rev", message);
    console.log(connectionMapUsers); 
    
    if (connectionMapUsers[message.userKey]) {
      console.log("something to send");
      connectionMapUsers[message.userKey].send(JSON.stringify(message));
    }

  } 

  res.send("asdf")

});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({
  server
});

wss.on("connection", (socket) => {
  // The server cannot be determined with just the connection because the name server and the user key has to be sent.
  console.log("Client connected");

  socket.on("message", async (data) => {

    const message = JSON.parse(data.toString());

    switch (message.messageType) {
      case "connect": // The userKey already exists.
        console.log("CConnecred");
        console.log();
        connectionMapUsers[message.userKey] = socket;
        redirectToGameserver(message);
        break;
      case "joinNewUser":
        console.log("join_user");
        // The state of the game has to be checked. The request needs the username and the game id.
        const state = await redis.get(message.roomNo);
        if (state == "WAITING") {
          const userKey = crypto.randomUUID(); // The userKey is defined.

          await redis.set(userKey, message.roomNo, { EX: 10_000 });
          message["userKey"] = userKey;
          connectionMapServer[message.roomNo].send(message);
          console.log("Added ws");
          console.log(connectionMapUsers);
          connectionMapUsers[userKey] = socket;

          // The gateway sends the user the key.
          socket.send(JSON.stringify({
            messageType: "assignUserKey",
            "userKey": userKey,
            "userName": message.userName,
          }));

                     
          
        }
        
    }

  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});