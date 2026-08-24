import { useState, useRef, useEffect } from 'react'

export default function ChatBox({ isDrawer, onGuess, wordToDraw }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'System', text: 'Game started! Good luck!', type: 'system' }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    if (isDrawer) {
      // Drawer can't guess, only chat
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'You',
        text: input,
        type: 'chat'
      }])
    } else {
      // Guesser
      const isCorrect = input.toLowerCase().trim() === wordToDraw.toLowerCase()
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'You',
        text: input,
        type: isCorrect ? 'correct' : 'guess'
      }])
      if (isCorrect) onGuess?.()
    }
    setInput('')
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 400,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '2px solid #f0f0f0',
        fontWeight: 700,
        color: '#667eea',
        fontSize: '1.1rem'
      }}>
        {isDrawer ? 'Chat' : 'Guess the Word!'}
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              background: msg.type === 'system' ? '#fef3c7'
                : msg.type === 'correct' ? '#dcfce7'
                : msg.type === 'chat' ? '#f3f4f6'
                : '#e0e7ff',
              color: msg.type === 'system' ? '#92400e'
                : msg.type === 'correct' ? '#166534'
                : '#374151',
              fontSize: '0.9rem',
              alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: 2, opacity: 0.7 }}>
              {msg.sender}
            </div>
            {msg.text}
            {msg.type === 'correct' && <span style={{ marginLeft: 4 }}>🎉</span>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        style={{
          padding: '12px 16px',
          borderTop: '2px solid #f0f0f0',
          display: 'flex',
          gap: 8
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isDrawer ? "Chat with players..." : "Type your guess..."}
          style={{
            flex: 1,
            padding: '10px 10px',
            borderRadius: 10,
            border: '2px solid #e0e0e0',
            fontSize: '0.95rem'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 10px',
            borderRadius: 10,
            background: '#667eea',
            color: 'white',
            fontWeight: 700
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}