import { WebSocketServer } from "ws";
import { parseCookie } from 'cookie'
import { Game } from "./Game.js";

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

const numberRounds = process.env.NUMBER_ROUNDS;
const game = new Game(6, "qwerty", "mi-user");


const wss = new WebSocketServer({ port: 8080 });

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
  console.log("Player connected");
  
  ws.on("message", (data) => {

    doActionAlreadyConnected();
    doActionWhileConnecting(request, ws);

    const message = JSON.parse(data.toString());
    
    if (message.messageType == "normalReq") {
      const req = game.writeData(message.userKey);
      ws.send(JSON.stringify(req));
    }

    // It prints the messages received.
    console.log("Received:", message);
    
    
  });

  ws.on("close", () => {
    console.log("Player disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  
    
});

console.log("WebSocket server listening on ws://localhost:8080");