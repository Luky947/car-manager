import type { FuelRecord } from '../../types'
import { formatDate, formatMileage } from '../../utils/formatters'
import { usePressable } from '../../hooks/usePressable'

interface Props {
  record: FuelRecord
  onPress: () => void
}

export default function FuelCard({ record, onPress }: Props) {
  const { handlers, style: pressStyle } = usePressable(() => {
    navigator.vibrate?.(10)
    onPress()
  })

  return (
    <button
      type="button"
      {...handlers}
      style={{
        ...pressStyle,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        borderRadius: 16,
        border: '0.5px solid rgba(255,255,255,0.07)',
        padding: 16,
        minHeight: 60,
        marginBottom: 8,
        touchAction: 'manipulation',
        textAlign: 'left',
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
    </button>
  )
}
