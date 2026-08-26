import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

export default function Leaderboard() {
  const navigate = useNavigate()
  const { players, scores, setGameState, isCreator, setCurrentDrawer, setPlayers } = useGame()
  const [ranked, setRanked] = useState([])


  // This useEffect loads the information of the leaderboard (players, scores)
  useEffect(() => {
    const combined = players.map(p => ({
      ...p,
      finalScore: (p.score || 0) + (scores[p.id] || 0)
    }))
    combined.sort((a, b) => b.finalScore - a.finalScore)
    setRanked(combined)
  }, [players, scores])

  const handlePlayAgain = () => {
    // Rotate drawer
    setCurrentDrawer(prev => {
      const idx = players.findIndex(p => p.id === prev)
      return players[(idx + 1) % players.length]?.id || players[0]?.id
    })
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 })))
    setGameState('playing')
    navigate('/game')
  }

  const handleBackHome = () => {
    setGameState('home')
    navigate('/')
  }

  const getTrophy = (idx) => {
    if (idx === 0) return '🥇'
    if (idx === 1) return '🥈'
    if (idx === 2) return '🥉'
    return ''
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏆</h1>
        <h2 style={{ fontSize: '1.8rem', color: '#333', marginBottom: 30 }}>
          Round Over!
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30 }}>
          {ranked.map((p, idx) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 20px',
                borderRadius: 14,
                background: idx === 0 ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                  : idx === 1 ? '#f3f4f6'
                  : idx === 2 ? '#fef7ed'
                  : 'white',
                border: idx === 0 ? '2px solid #f59e0b' : '2px solid #e5e7eb',
                transform: idx === 0 ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>{getTrophy(idx)}</span>
              <span style={{ fontSize: '1.5rem' }}>{p.avatar}</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#333' }}>
                  {p.name}
                </div>
                {idx === 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>
                    Winner!
                  </span>
                )}
              </div>
              <div style={{
                fontWeight: 800,
                fontSize: '1.3rem',
                color: idx === 0 ? '#d97706' : '#667eea'
              }}>
                {p.finalScore} pts
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {isCreator && (
            <button
              onClick={handlePlayAgain}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              Next Round
            </button>
          )}
          <button
            onClick={handleBackHome}
            style={{
              padding: '14px 28px',
              borderRadius: 12,
              background: '#f3f4f6',
              color: '#374151',
              fontSize: '1rem',
              fontWeight: 700
            }}
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  )
}