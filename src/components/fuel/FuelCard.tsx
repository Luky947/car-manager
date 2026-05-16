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
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHorizontal = useRef<boolean | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
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
      if (Math.abs(dx) > Math.abs(dy) + 3) isHorizontal.current = true
      else if (Math.abs(dy) > Math.abs(dx) + 3) isHorizontal.current = false
      return
    }

    if (!isHorizontal.current) return
    setOffsetX(Math.min(0, Math.max(dx, -220)))
  }

  function handleTouchEnd() {
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

      {/* Card */}
      <button
        type="button"
        className="pressable"
        onClick={() => {
          if (offsetX < -10) { setOffsetX(0); return }
          navigator.vibrate?.(10)
          onPress()
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          background: '#141414',
          borderRadius: 16,
          border: '0.5px solid rgba(255,255,255,0.07)',
          padding: 16,
          touchAction: onDelete ? 'pan-y' : 'manipulation',
          textAlign: 'left',
          transform: `translateX(${offsetX}px)`,
          transition: 'transform 250ms cubic-bezier(0.2, 0, 0, 1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
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
      </button>
    </div>
  )
}
