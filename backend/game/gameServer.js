import { WebSocketServer } from "ws";
import { parseCookie } from 'cookie'
import { Game } from "./Game.js";
import express from 'express';
import { createClient } from "redis";

// When the server is created it should already:
// - Create the Game object with the number of rounds.
// - The number of rounds are given through the environment variables.
// - The first player is added and is given the 'admin' tag.

// What does is the data of the data object in a response of the WebSocket connection?
// It data.
//         userKey: crypto.randomUUID();
//         messageType: newDrawing, message, wordTry, newConnection
//         userName: Just during the first request

// If it's the first connection of the user, it does't have a userKey. It is created by the game object and returned through the connection.
// The only 'cookie' that the user has to send through each request, is it's userKey.
setInterval(() => {
  process.exit(0);
}, 100_000);

// The only thing the game server has to do is change the state of the redis key.
const redis = createClient({
    url: "redis://cache:6379"
});
await redis.connect().then(() => {
    console.log("Sucessfully connected");
});

const noRounds = process.env.NO_ROUNDS;
const adminKey = process.env.ADMIN_KEY;
const adminName = process.env.ADMIN_NAME;
const roomNo = process.env.ROOM_NU;


const game = new Game(noRounds, adminKey, adminName, roomNo);

const app = express();

app.get('/health', async (req, res) => {
  res.status(200).send("OK");
})  

const server = app.listen(8080, () => {
  console.log(`Server running on port 8080`);
});

const wss = new WebSocketServer({ server });

wss.on("error", (e) => {
  console.log(e.message);
  console.log(e.name);
})

function doActionAlreadyConnected() {

  switch (game.state) {
      case "WAITING": // The players just adds it's name
        break;

      case "PLAYING": // Players sends painting or word


        if (message == words[round]) {
          game.state = "WINNER";
        }
        break;

      case "WINNER":

        nextRound(); // It has to change after some time;
        break;

      case "END": // It just shows the leaderboard
        break;

    }

}

function doActionWhileConnecting(data, ws) {

  // GAME: On connection

  switch (game.state) {
    case "WAITING":
      let uuid = crypto.randomUUID();
      ws.send(uuid);
      
      break;

    default:
      console.log("deafdult");
  }

}



// The service is connected to a WebSocket gateway, so the ws is not really important. What matters is the userKey.
wss.on("connection", (ws, request) => {

  function sendAllUsers(req, noUsers) {

      // TODO: This function has to send a request to all users. It must return a request with a list of userKeys.
      //       The gateway has a map off all the connections userKey: ws.
      wss.clients.forEach((client) => {
        client.send(req);
      })
  }

  console.log("Player connected");
  
  ws.on("message", async (data) => {
    console.log("A message");

    // doActionAlreadyConnected();
    // doActionWhileConnecting(request, ws);
    console.log(data.toString());

    const message = JSON.parse(data.toString());

    switch (message.messageType) {
      case "normalReq":
      case "connect":
        console.log("A normal request--");
        const req = game.writeData(message.userKey);
        console.log("pre send");
        req["userKey"] = message.userKey;
        ws.send(JSON.stringify(req));
        console.log("post send");
        break;



      case "joinNewUser":
        // This funciton has to update the screen of all users.s
        console.log("onJoinNew");
        game.addNewUser(message.userName, message.userKey); // The new user is added
        const req3 = game.writeData(message.userKey);
        const all = Object.keys(game.players);

        const req4 = {
          req: req3,
          [adminKey]: game.adminKey,
          all: all,
          this: message.userKey,
        }

        ws.send(JSON.stringify(req4));
        
        break;

      case "startGame":
        if (message.userKey == game.adminKey) {



          game.startGame(ws);
          console.log("roomCode", game.roomCode)
          await redis.set(String(game.roomCode), "PLAYING", { KEEPTTL: true });
          const all2 = Object.keys(game.players);
  
          const req6 = game.writeData(message.userKey);
          const req5 = {
            req: req6,
            all: all2,
            this: message.userKey,
          }
  
          ws.send(JSON.stringify(req5));
        }



        console.log("out_startGame");

        break;

      case "updateDrawing":
        game.updateDrawing(message.drawing);

        const req2 = game.writeData(null);
        sendAllUsers(req2);

        break;

      case "assignUserKey":
        game.addNewUser(message.userName, message.userKey);
        break;



    }

    // It prints the messages received.
    console.log("END of case");
    
    
  });

  ws.on("close", () => {
    console.log("Player disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  console.log("still");

});



console.log("WebSocket server listening on ws://localhost:8080");