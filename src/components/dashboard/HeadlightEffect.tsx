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

  const drlShadow = '0 0 6px 2px rgba(200,225,255,0.9), 0 0 16px 5px rgba(180,210,255,0.5), 0 0 30px 8px rgba(160,195,255,0.2)'

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {/* Left headlight — main */}
      <div style={{
        position: 'absolute',
        top: '62%',
        left: '18%',
        width: '50px',
        height: '10px',
        background: 'rgba(220,240,255,0.95)',
        borderRadius: '5px',
        opacity,
        transform: 'rotate(-8deg)',
        filter: 'blur(1.5px)',
        boxShadow: drlShadow,
        transition: 'opacity 40ms ease',
        border: '1px solid red',
      }} />

      {/* Right headlight */}
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '32%',
        width: '32px',
        height: '8px',
        background: 'rgba(220,240,255,0.95)',
        borderRadius: '5px',
        opacity,
        transform: 'rotate(-6deg)',
        filter: 'blur(1.5px)',
        boxShadow: drlShadow,
        transition: 'opacity 40ms ease',
        border: '1px solid red',
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
