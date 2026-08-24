class Player {
  constructor(userName) {
    this.name = userName;
    this.points = 0;
  }
}

// It controlls every aspect of the game. The WS connection creates it, updates it ad it also tells which components to write to the players.
export class Game {
  constructor(numWords, adminKey, adminName) {
    this.words = [];
    this.searchWords(numWords);
    this.round = 0
    this.wsConnection;
    this.time = 100
    this.state = "WAITING"
    this.draw = undefined;
    this.adminKey = adminKey;
    this.roomCode = Math.floor(100000 + Math.random() * 900000);
    this.players = { // The game just uses the id of the player, the names is just a value the frontend uses.
      [adminKey]: new Player(adminName),
    }
    this.leaderboard = undefined;
    this.lastWon = "";
    this.chat = [];
    
  }

  readDataDraw(draw) {
    this.draw = draw;
    this.writeData();
  }
  readDataNewMessage(message) {
    this.chat.push(message);
    this.writeData();
  }

  readDataDecreaseTime(message) {
    this.time -= 1;
    this.writeData();
  }
  
  readDataPossibleWord(player, word) {
    if (word == this.words[this.round]) {
      this.lastWon = player;
      this.state = "WINNER";
      this.deleteChat();
    }
  }

  deleteChat() {
    this.chat = [];
  }

  // It prints all the data that has to be send to the users during each phase.
  writeData(userKey) {
    
    switch(this.state) {
      case "WAITING":
        let listPlayersNoID = [];

        Object.entries(this.players).forEach(([id, obj]) => {
          listPlayersNoID.push(obj.name);
        });
        console.log("User players", userKey, this.players);
        const res = {
          players: listPlayersNoID,
          playerName: this.players[userKey].name,
          roomCode: this.roomCode,
          state: this.state,
        };

        if (userKey == this.adminKey) {
          res.isCreator = true;
        } else {
          res.isCreator = false;
        }
        console.log("Request to send: ");
        console.log(res);
        return res;
        break;

      case "PLAYING":

        let leader = calcLeaderboard();

        this.wsConnection.send(JSON.stringify({
          draw: this.draw,
          state: this.state,
          time: this.time,
          leader: leader,
          chat: this.chat,
        }));
        break;

      case "WINNER": // It returns the name of the player that won.

      this.wsConnection.send(JSON.stringify({
        word: words[this.round],
        player: this.lastWon,
      }))
        
        break;

      case "END":
        let list = calcLeaderboard();
        this.wsConnection.send(JSON.stringify(list));
        break;
        
    }

  }

  calcLeaderboard() {

    let playerPointsList = [];

    Object.entries(this.players).forEach(([id, obj]) => {
        playerPointsList.push({
          name: obj.name,
          points: obj.points
      });
    });

    playerPointsList.sort((a, b) => b.points - a.points);
    return playerPointsList;
      
  }

  searchWords(numWords) {
    this.words = ["apple", "carrot", "train", "movie"];
    
  }

  nextRound() {
    if ((this.roun+1) >= words.length) {
      state = "END";
    } else {
      this.round += 1;
      this.time = 100;
    }
  }

  addNewUser(userName) {

    const userKey = crypto.randomUUID();
    this.players[userKey] = new Player(userName);

  }
}