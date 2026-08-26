import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
}

export default function Home() {
  const navigate = useNavigate()
  const { setRoomCode, setIsCreator, setPlayerName, generateRoomCode, wsRef, playerName } = useGame()
  const [joinCode, setJoinCode] = useState('')
  const [name, setName] = useState('')



  // TODO: This method should not only make a connection, it has to create the server and then connect.
  // The userKey is created by the api. Not by the server. So the user already has it before doing the connetion.
  const handleCreate = () => {
    if (!name.trim()) return alert('Enter your name first!')

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;
    
    wsRef.current.onopen = () => {
      const msg = JSON.stringify({
        userKey: getCookie('userKey'),
        messageType: 'normalReq',
      }); 
      console.log("Handle create msg");
      console.log(msg);

      wsRef.current.send(msg);
    }

  }

  // This method is responsible for joining users to already created servers
  // The user doesn't have a userKey, so the first request doesn't have one.
  const handleJoin = () => {
    if (!name.trim()) return alert('Enter your name first!')
    if (joinCode.length !== 6) return alert('Enter a valid 6-digit room code!')

    console.log("Try to join");
    console.log("userKey", name, getCookie('userKey'));
    // TODO: Here the connections is directly made. It should connect to a gateway and then test the connection.
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;


    
      // This method is to save the received userKey in the Cookies after the connection.
      wsRef.current.onmessage = (event) => {

        console.log("onmessage handle join");
        console.log(event.data);
        const message = JSON.parse(event.data.toString());
        document.cookie = `userKey=${message.userKey}`;

        window.location.reload();

      }
      
      wsRef.current.onopen = () => {
        const msg = JSON.stringify({
          messageType: 'joinNewUser',
          userName: name,
        });
        wsRef.current.send(msg);
      }

  }

  return (
    <div className="page">
      <div className="card" style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#667eea', marginBottom: 8 }}>
          Sketch Arena
        </h1>
        <p style={{ color: '#888', marginBottom: 30 }}>Draw, Guess, Win!</p>

        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Your nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 12,
              border: '2px solid #e0e0e0',
              fontSize: '1rem',
              marginBottom: 20
            }}
          />

          <button
            onClick={handleCreate}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: 12
            }}
          >
            Create Server
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Room code (6 digits)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: 12,
                border: '2px solid #e0e0e0',
                fontSize: '1rem'
              }}
            />
            <button
              onClick={handleJoin}
              style={{
                padding: '14px 24px',
                borderRadius: 12,
                background: '#48bb78',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              Join Server
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}