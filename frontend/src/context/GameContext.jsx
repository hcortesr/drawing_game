import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Each response from the WebSocket muss contain this attributes: page

const GameContext = createContext()

export const useGame = () => useContext(GameContext)

export const GameProvider = ({ children }) => {

  const navigate = useNavigate();

  const wsRef = useRef(null);
  const canvasRef = useRef(null)

  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [isCreator, setIsCreator] = useState(false)
  const [players, setPlayers] = useState([])
  const [gameState, setGameState] = useState('home') // home, lobby, playing, leaderboard
  const [currentDrawer, setCurrentDrawer] = useState(null)
  const [wordToDraw, setWordToDraw] = useState('')
  const [scores, setScores] = useState({})
  const [round, setRound] = useState(1)
  const [timeLeft, setTimeLeft] = useState(100)
  const [isDrawer, setIsDrawer] = useState(false)


  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
  }

  function loadCanvas (canvas, dataURL) {
  const img = new Image();

  img.onload = () => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };

  img.src = dataURL;
  }

  useEffect(() => {
    const cookie = getCookie('userKey');


    // Make the connection.
    if (cookie != undefined) {
      // This function must talk to the gateway using it's routes.
      wsRef.current = new WebSocket("ws://localhost:8081");

      wsRef.current.onopen = () => {
      const msg = JSON.stringify({
        userKey: getCookie('userKey'),
        messageType: 'connect',
      }); 
      console.log("Handle create msg");
      console.log(msg);

      wsRef.current.send(msg);

    }
    wsRef.current.onclose = (event) => {
      console.log("CcClosed");
    }

    // What to do when a message is received.
    wsRef.current.onmessage = (event) => {
    
      const message = JSON.parse(event.data.toString());

      console.log("GameContext: Message received");
      console.log(event.data);
      console.log(message);

      switch(message.state) {

        // This is what the user received after it has sucessfuly logged in. It is automatically redirected to the lobby.
        case 'WAITING':
          setRoomCode(message.roomCode);
          setPlayerName(message.playerName);
          setIsCreator(message.isCreator);
          setGameState('WAITING');

          const mockPlayers = [];
          message.players.forEach((player, index) => {
            let isC = index === 0;
            console.log(player, isC);

            mockPlayers.push({ id: 1, name: player || 'You', isCreator: isC, score: 0, avatar: '🎨' });
          })
          setPlayers(mockPlayers)

          
          navigate('/lobby');
          break;

        case 'PLAYING':

        /*
          Information that the server sends each second.

          draw: this.draw,
          state: this.state,
          time: this.time,
          leader: leader,
          chat: this.chat,

          //TODO: add these properties to the server.
          isDrawer

        */

          // This case musst also inform the user if it is the current drawer.

          setTimeLeft(message.time);
          loadCanvas(canvasRef, message.draw);
          


          navigate('/game');
          break;


          
        }
  
      };
      
    }
  }, []);

  const value = {
    roomCode, setRoomCode,
    playerName, setPlayerName,
    isCreator, setIsCreator,
    players, setPlayers,
    gameState, setGameState,
    currentDrawer, setCurrentDrawer,
    wordToDraw, setWordToDraw,
    scores, setScores,
    round, setRound,
    timeLeft, setTimeLeft,
    wsRef,
    canvasRef,
    isDrawer,
    setIsDrawer,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}