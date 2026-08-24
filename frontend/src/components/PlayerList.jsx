export default function PlayerList({ players, currentDrawerId }) {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0))

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ marginBottom: 12, color: '#333', fontSize: '1.1rem' }}>Players</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((p, idx) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              background: p.id === currentDrawerId ? '#fef3c7' : '#f8f9fa',
              border: p.id === currentDrawerId ? '2px solid #f59e0b' : '2px solid transparent'
            }}
          >
            <span style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : idx === 2 ? '#b45309' : '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: idx < 3 ? 'white' : '#666'
            }}>
              {idx + 1}
            </span>
            <span style={{ fontSize: '1.2rem' }}>{p.avatar}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#333',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {p.name} {p.id === currentDrawerId && '✏️'}
              </div>
            </div>
            <div style={{
              fontWeight: 800,
              color: '#667eea',
              fontSize: '0.95rem'
            }}>
              {p.score || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}