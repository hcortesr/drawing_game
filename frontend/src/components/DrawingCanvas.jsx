import { useRef, useState, useEffect } from 'react'
import { useGame } from '../context/GameContext';

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b',
  '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#d946ef', '#f43f5e', '#78716c', '#a8a29e'
]

const BRUSH_SIZES = [4, 8, 16, 24]

export default function DrawingCanvas({ isDrawer }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState('brush'); // brush, eraser
  const { canvasRef, wsRef } = useGame();

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  

  const sendDrawing = () => {
    // TODO: Do websocket connection.
    // It has to send the image through WebSocket.
    // The canvas should be stored in the context of the app.

    const canvas = canvasRef.current;
    const canvasBase64 = canvas.toDataURL("image/png");

    const req = {
      messageType: "updateDrawing",
      drawing: canvasBase64,
    };
    
    wsRef.send(req);
    
  }

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    }
  }

  const startDrawing = (e) => {
    if (!isDrawer) return
    setIsDrawing(true)
    const { x, y } = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    sendDrawing();
    if (!isDrawing || !isDrawer) return
    const { x, y } = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Canvas */}
      <div style={{
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        background: '#fff',
        position: 'relative'
      }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            cursor: isDrawer ? 'crosshair' : 'default',
            touchAction: 'none'
          }}
        />
        {!isDrawer && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'transparent',
            cursor: 'not-allowed'
          }} />
        )}
      </div>

      {/* Toolbar - only for drawer */}
      {isDrawer && (
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          {/* Colors */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('brush') }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: c,
                  border: color === c && tool === 'brush' ? '3px solid #333' : '2px solid #ddd',
                  transform: color === c && tool === 'brush' ? 'scale(1.15)' : 'scale(1)'
                }}
              />
            ))}
          </div>

          <div style={{ width: 1, height: 30, background: '#e0e0e0' }} />

          {/* Brush sizes */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {BRUSH_SIZES.map(size => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                style={{
                  width: size + 8,
                  height: size + 8,
                  borderRadius: '50%',
                  background: brushSize === size ? '#667eea' : '#e0e0e0',
                  border: 'none',
                  minWidth: 20,
                  minHeight: 20
                }}
              />
            ))}
          </div>

          <div style={{ width: 1, height: 30, background: '#e0e0e0' }} />

          {/* Tools */}
          <button
            onClick={() => setTool('eraser')}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: tool === 'eraser' ? '#667eea' : '#f0f0f0',
              color: tool === 'eraser' ? 'white' : '#333',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Eraser
          </button>

          <button
            onClick={clearCanvas}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: '#fee2e2',
              color: '#dc2626',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}