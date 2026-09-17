import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import DrawingCanvas from '../components/DrawingCanvas'
import ChatBox from '../components/ChatBox'
import PlayerList from '../components/PlayerList'

export default function Game() {
  const navigate = useNavigate()
  const {
    roomCode, playerName, players, setPlayers,
    currentDrawer, setCurrentDrawer, wordToDraw, setWordToDraw,
    round, timeLeft, setTimeLeft, setScores, isDrawer, setIsDrawer,
  } = useGame()

  
  const [localTime, setLocalTime] = useState(timeLeft)

  // Mock: determine if current player is drawer
  useEffect(() => {
    const me = players.find(p => p.name === playerName)
    if (me) {
      setIsDrawer(me.id === currentDrawer)
    }
    setWordToDraw('sunset')
  }, [currentDrawer, players, playerName])

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(prev => {
        if (prev <= 1) {
          // Round over -> leaderboard
          setScores(prevScores => {
            const newScores = { ...prevScores }
            players.forEach(p => { newScores[p.id] = (newScores[p.id] || 0) + Math.floor(Math.random() * 100) })
            return newScores
          })
          navigate('/leaderboard')
          return 80
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate, players, setScores])

  const handleCorrectGuess = () => {
    setPlayers(prev => prev.map(p =>
      p.name === playerName ? { ...p, score: (p.score || 0) + 100 } : p
    ))
  }

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        borderRadius: 16,
        padding: '12px 20px',
        marginBottom: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 800, color: '#667eea', fontSize: '1.2rem' }}>
            Sketch Arena
          </span>
          <span style={{
            background: '#f0f0f0',
            padding: '4px 12px',
            borderRadius: 10,
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#666'
          }}>
            Room: {roomCode}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {isDrawer ? (
            <div style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '6px 16px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: 2
            }}>
              {wordToDraw || '????'}
            </div>
          ) : (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '6px 16px',
              borderRadius: 10,
              fontWeight: 700
            }}>
              Guess the word!
            </div>
          )}
          <div style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '6px 14px',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: '0.95rem'
          }}>
            Round {round}
          </div>
          <div style={{
            background: localTime <= 10 ? '#fee2e2' : '#e0e7ff',
            color: localTime <= 10 ? '#dc2626' : '#3730a3',
            padding: '6px 14px',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: '1.1rem',
            minWidth: 50,
            textAlign: 'center'
          }}>
            {localTime}s
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 280px',
        gap: 16,
        maxWidth: 1400,
        margin: '0 auto'
      }}>

        <ChatBox
              isDrawer={isDrawer}
              wordToDraw={wordToDraw}
              onGuess={handleCorrectGuess}
            />

        

        {/* Left: Canvas + Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <DrawingCanvas isDrawer={isDrawer} />
          
        </div>

        {/* Right: Players */}
        <div>
          <PlayerList players={players} currentDrawerId={currentDrawer} />
        </div>
      </div>
    </div>
  )
}