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
      await delay(600)
      if (cancelled) return

      setOpacity(1)
      await delay(180)
      if (cancelled) return
      setOpacity(0)
      await delay(120)
      if (cancelled) return

      setOpacity(1)
      await delay(220)
      if (cancelled) return
      setOpacity(0.3)
      await delay(80)
      if (cancelled) return
      setOpacity(0)
    }

    welcomeBlink()
    return () => { cancelled = true }
  }, [location.pathname])

  const glowOpacity = opacity * 0.6

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {/* Left headlight */}
      <div style={{
        position: 'absolute',
        bottom: '28%',
        left: '22%',
        width: '80px',
        height: '40px',
        background: 'radial-gradient(ellipse at left center, rgba(255,240,180,0.9) 0%, rgba(255,220,100,0.4) 40%, transparent 70%)',
        borderRadius: '50%',
        opacity,
        transform: 'rotate(-8deg)',
        filter: 'blur(2px)',
        transition: 'opacity 60ms ease',
      }} />

      {/* Right headlight */}
      <div style={{
        position: 'absolute',
        bottom: '26%',
        left: '38%',
        width: '70px',
        height: '35px',
        background: 'radial-gradient(ellipse at left center, rgba(255,240,180,0.85) 0%, rgba(255,220,100,0.35) 40%, transparent 70%)',
        borderRadius: '50%',
        opacity,
        transform: 'rotate(-6deg)',
        filter: 'blur(2px)',
        transition: 'opacity 60ms ease',
      }} />

      {/* Ambient ground glow */}
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '10%',
        right: '10%',
        height: '20px',
        background: 'radial-gradient(ellipse, rgba(255,220,100,0.15) 0%, transparent 70%)',
        opacity: glowOpacity,
        transition: 'opacity 60ms ease',
      }} />
    </div>
  )
}
