import type { ServiceRecord } from '../../types'
import { getReminderStatus } from '../../utils/reminders'
import { formatDate, formatMileage } from '../../utils/formatters'
import { SERVICE_TYPE_LABELS } from '../../utils/serviceTypes'
import { usePressable } from '../../hooks/usePressable'
import ServiceIcon from './ServiceIcon'
import ReminderDot from '../ui/ReminderDot'

interface Props {
  record: ServiceRecord
  currentMileage: number
  onPress: () => void
}

export default function ServiceCard({ record, currentMileage, onPress }: Props) {
  const status = record.reminderEnabled ? getReminderStatus(record, currentMileage) : 'none'
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
  )
}
