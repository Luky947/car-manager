import { useState, useRef } from 'react'
import type { FuelRecord } from '../../types'
import { formatDate, formatMileage } from '../../utils/formatters'

interface Props {
  record: FuelRecord
  onPress: () => void
  onDelete?: () => void
}

export default function FuelCard({ record, onPress, onDelete }: Props) {
  const [offsetX, setOffsetX] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [pressed, setPressed] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHorizontal = useRef<boolean | null>(null)
  const lastTouch = useRef(0)

  function handleTouchStart(e: React.TouchEvent) {
    lastTouch.current = Date.now()
    setPressed(true)
    if (!onDelete) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontal.current = null
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!onDelete) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    if (isHorizontal.current === null) {
      if (Math.abs(dx) > Math.abs(dy) + 3) {
        isHorizontal.current = true
        setPressed(false)
      } else if (Math.abs(dy) > Math.abs(dx) + 3) {
        isHorizontal.current = false
      }
      return
    }

    if (!isHorizontal.current) return
    setOffsetX(Math.min(0, Math.max(dx, -220)))
  }

  function handleTouchEnd() {
    setPressed(false)
    if (!onDelete || isHorizontal.current !== true) return
    if (offsetX < -160) {
      setDeleting(true)
      navigator.vibrate?.([10, 50, 10])
      setTimeout(() => onDelete(), 280)
    } else if (offsetX < -40) {
      setOffsetX(-80)
    } else {
      setOffsetX(0)
    }
  }

  function handleDeleteTap(e: React.MouseEvent) {
    e.stopPropagation()
    setDeleting(true)
    navigator.vibrate?.([10, 50, 10])
    setTimeout(() => onDelete?.(), 280)
  }

  return (
    <div style={{
      position: 'relative',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: deleting ? 0 : 8,
      maxHeight: deleting ? 0 : 300,
      opacity: deleting ? 0 : 1,
      transition: 'max-height 280ms ease, opacity 200ms ease, margin-bottom 280ms ease',
    }}>
      {/* Delete background */}
      {onDelete && (
        <div
          onClick={handleDeleteTap}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
            background: '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>Smazat</span>
        </div>
      )}

      {/* Swipe wrapper — transparent, handles translateX only */}
      <button
        type="button"
        onClick={() => {
          if (offsetX < -10) { setOffsetX(0); return }
          navigator.vibrate?.(10)
          onPress()
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => setPressed(false)}
        onMouseDown={() => { if (Date.now() - lastTouch.current < 500) return; setPressed(true) }}
        onMouseUp={() => { if (Date.now() - lastTouch.current < 500) return; setPressed(false) }}
        onMouseLeave={() => setPressed(false)}
        style={{
          display: 'block',
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: 0,
          outline: 'none',
          touchAction: onDelete ? 'pan-y' : 'manipulation',
          transform: `translateX(${offsetX}px)`,
          transition: 'transform 250ms cubic-bezier(0.2, 0, 0, 1)',
          position: 'relative',
          zIndex: 1,
          cursor: 'pointer',
        }}
      >
        {/* Visual card layer — handles press feedback independently */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: pressed ? '#222222' : '#1c1c1e',
          borderRadius: 16,
          border: '0.5px solid rgba(255,255,255,0.07)',
          padding: 16,
          minHeight: 60,
          textAlign: 'left',
          opacity: pressed ? 0.7 : 1,
          transform: pressed ? 'scale(0.98)' : 'scale(1)',
          transition: pressed
            ? 'transform 60ms cubic-bezier(0.2,0,0,1), opacity 60ms, background 60ms'
            : 'transform 300ms cubic-bezier(0.34,1.56,0.64,1), opacity 200ms, background 200ms',
        }}>
          {/* Icon */}
          <div style={{
            flexShrink: 0, background: '#1e1e1e', borderRadius: 10, padding: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16" />
              <path d="M3 22h12M14 10h2a2 2 0 012 2v3a1 1 0 001 1 1 1 0 001-1V8l-3-3" />
              <path d="M7 8h4M7 12h4" />
            </svg>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 3, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0' }}>{formatDate(record.date)}</span>
              <span style={{ fontSize: 12, color: '#5c6070' }}>·</span>
              <span style={{ fontSize: 12, color: '#9a9da8' }}>{formatMileage(record.mileage)}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#9a9da8' }}>{record.liters.toFixed(1)} l</span>
              <span style={{ fontSize: 12, color: '#5c6070' }}>·</span>
              <span style={{ fontSize: 12, color: '#9a9da8' }}>{record.pricePerLiter.toFixed(2)} Kč/l</span>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0' }}>
                {record.totalCost.toLocaleString('cs-CZ')} Kč
              </span>
              {record.fullTank && (
                <span style={{
                  fontSize: 10, fontWeight: 600, color: '#22c55e',
                  background: 'rgba(34,197,94,0.12)',
                  border: '0.5px solid rgba(34,197,94,0.2)',
                  borderRadius: 6, padding: '2px 7px',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  Plná
                </span>
              )}
            </div>
            <svg width="8" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  )
}
