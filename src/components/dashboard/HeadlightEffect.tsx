import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function HeadlightEffect() {
  const [opacity, setOpacity] = useState(0)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/') return

    let cancelled = false
    const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    async function welcomeBlink() {
      await delay(500)
      if (cancelled) return

      setOpacity(1)
      await delay(120)
      if (cancelled) return
      setOpacity(0)
      await delay(100)
      if (cancelled) return

      setOpacity(1)
      await delay(180)
      if (cancelled) return
      setOpacity(0)
    }

    welcomeBlink()
    return () => { cancelled = true }
  }, [location.pathname])

  const drlShadow = '0 0 8px 3px rgba(200,225,255,0.8), 0 0 20px 6px rgba(180,210,255,0.4), 0 0 40px 10px rgba(160,195,255,0.15)'

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {/* Left DRL strip — main headlight */}
      <div style={{
        position: 'absolute',
        bottom: '38%',
        left: '18%',
        width: '55px',
        height: '12px',
        background: 'rgba(220,240,255,0.95)',
        borderRadius: '6px',
        opacity,
        transform: 'rotate(-5deg)',
        filter: 'blur(1.5px)',
        boxShadow: drlShadow,
        transition: 'opacity 40ms ease',
      }} />

      {/* Right DRL strip — smaller, angled */}
      <div style={{
        position: 'absolute',
        bottom: '36%',
        right: '28%',
        width: '30px',
        height: '8px',
        background: 'rgba(220,240,255,0.95)',
        borderRadius: '4px',
        opacity,
        transform: 'rotate(-3deg)',
        filter: 'blur(1.5px)',
        boxShadow: drlShadow,
        transition: 'opacity 40ms ease',
      }} />

      {/* Ambient ground glow */}
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '10%',
        right: '10%',
        height: '20px',
        background: 'radial-gradient(ellipse, rgba(180,210,255,0.12) 0%, transparent 70%)',
        opacity: opacity * 0.6,
        transition: 'opacity 40ms ease',
      }} />
    </div>
  )
}
