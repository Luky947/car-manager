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
}

export default function ServiceCard({ record, currentMileage, onPress }: Props) {
  const status = record.reminderEnabled ? getReminderStatus(record, currentMileage) : 'none'

  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        background: '#1e1d2e',
        borderRadius: 14,
        border: '0.5px solid rgba(255,255,255,0.06)',
        padding: '14px 16px',
        marginBottom: 8,
        touchAction: 'manipulation',
        textAlign: 'left',
        transition: 'transform 100ms',
      }}
      onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
      onPointerUp={e => (e.currentTarget.style.transform = '')}
      onPointerLeave={e => (e.currentTarget.style.transform = '')}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: 'rgba(255,255,255,0.06)',
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        {record.cost != null && (
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>
            {record.cost.toLocaleString('cs-CZ')} Kč
          </span>
        )}
        {record.reminderEnabled && status !== 'none' && (
          <ReminderDot status={status} />
        )}
      </div>
    </button>
  )
}
