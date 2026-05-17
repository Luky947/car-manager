import { useState, useRef } from 'react'
import type { ServiceRecord } from '../../types'
import { getReminderStatus } from '../../utils/reminders'
import { formatDate, formatMileage } from '../../utils/formatters'
import { SERVICE_TYPE_LABELS } from '../../utils/serviceTypes'
import ServiceIcon from './ServiceIcon'
import ReminderDot from '../ui/ReminderDot'

interface Props {
  record: ServiceRecord
  currentMileage: number
  onPress: () => void
  onDelete?: () => void
}

export default function ServiceCard({ record, currentMileage, onPress, onDelete }: Props) {
  const [offsetX, setOffsetX] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHorizontal = useRef<boolean | null>(null)

  const status = record.reminderEnabled ? getReminderStatus(record, currentMileage) : 'none'

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
      marginBottom: deleting ? 0 : 1,
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
          <ServiceIcon type={record.type} size={20} color="#e8e8e8" />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0', marginBottom: 3 }}>
            {SERVICE_TYPE_LABELS[record.type]}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#9a9da8' }}>{formatDate(record.date)}</span>
            <span style={{ fontSize: 12, color: '#5c6070' }}>·</span>
            <span style={{ fontSize: 12, color: '#9a9da8' }}>{formatMileage(record.mileage)}</span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {record.cost != null && (
              <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>
                {record.cost.toLocaleString('cs-CZ')} Kč
              </span>
            )}
            {record.reminderEnabled && status !== 'none' && (
              <ReminderDot status={status} />
            )}
          </div>
          <svg width="8" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </button>
    </div>
  )
}
