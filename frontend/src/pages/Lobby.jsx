import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

export default function Lobby() {
  const navigate = useNavigate()
  const { roomCode, playerName, isCreator, players, setPlayers, setCurrentDrawer } = useGame()
  const [localName, setLocalName] = useState(playerName)


  const handleStart = () => {
    setCurrentDrawer(players[0]?.id)
    navigate('/game')
  }

  const updateName = () => {
    
    
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 500, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.8rem', color: '#333' }}>Lobby</h2>
          <div style={{
            display: 'inline-block',
            background: '#f0f0f0',
            padding: '8px 20px',
            borderRadius: 20,
            marginTop: 10,
            fontWeight: 700,
            color: '#667eea',
            letterSpacing: 2
          }}>
            Room: {roomCode}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#555' }}>
            Your Name
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #e0e0e0',
                fontSize: '1rem'
              }}
            />
            <button
              onClick={updateName}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                background: '#667eea',
                color: 'white',
                fontWeight: 600
              }}
            >
              Save
            </button>
          </div>
        </div>

        <h3 style={{ marginBottom: 12, color: '#555' }}>Players ({players.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {players.map(p => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: p.isCreator ? '#f0fff4' : '#f8f9fa',
                borderRadius: 12,
                border: p.isCreator ? '2px solid #48bb78' : '2px solid transparent'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{p.avatar}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#333' }}>{p.name}</div>
                {p.isCreator && (
                  <span style={{ fontSize: '0.75rem', color: '#48bb78', fontWeight: 600 }}>
                    👑 Host
                  </span>
                )}
              </div>
              <div style={{ color: '#888', fontSize: '0.9rem' }}>0 pts</div>
            </div>
          ))}
        </div>

        {isCreator && (
          <button
            onClick={handleStart}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #48bb78, #38a169)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 700
            }}
          >
            Start Game
          </button>
        )}

        {!isCreator && (
          <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
            Waiting for the host to start...
          </p>
        )}
      </div>
    </div>
  )
}