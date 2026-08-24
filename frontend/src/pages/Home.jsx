import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
}

export default function Home() {
  const navigate = useNavigate()
  const { setRoomCode, setIsCreator, setPlayerName, generateRoomCode, wsRef } = useGame()
  const [joinCode, setJoinCode] = useState('')
  const [name, setName] = useState('')

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

  const handleJoin = () => {
    if (!name.trim()) return alert('Enter your name first!')
    if (joinCode.length !== 6) return alert('Enter a valid 7-digit room code!')
    setRoomCode(joinCode)
    setIsCreator(false)

    setPlayerName(name)

  
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
              placeholder="Room code (7 digits)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 7))}
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