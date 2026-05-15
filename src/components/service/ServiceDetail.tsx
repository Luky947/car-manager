import { useState } from 'react'
import type { ServiceRecord } from '../../types'
import { useServiceStore } from '../../stores/useServiceStore'
import { getReminderStatus } from '../../utils/reminders'
import { formatDate, formatMileage } from '../../utils/formatters'
import { SERVICE_TYPE_LABELS } from '../../utils/serviceTypes'
import BottomSheet from '../ui/BottomSheet'
import ServiceIcon from './ServiceIcon'
import ReminderDot from '../ui/ReminderDot'

interface Props {
  record: ServiceRecord | null
  isOpen: boolean
  onClose: () => void
  onEdit: (record: ServiceRecord) => void
  currentMileage: number
}

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between' as const,
  alignItems: 'flex-start' as const,
  padding: '10px 0',
  borderBottom: '0.5px solid rgba(0,0,0,0.06)',
}

const labelStyle = { fontSize: 13, color: '#5c6070', fontWeight: 500 }
const valueStyle = { fontSize: 13, color: '#0f0e17', fontWeight: 500, textAlign: 'right' as const, maxWidth: '60%' }

export default function ServiceDetail({ record, isOpen, onClose, onEdit, currentMileage }: Props) {
  const softDeleteRecord = useServiceStore(s => s.softDeleteRecord)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!record) return null

  const status = record.reminderEnabled ? getReminderStatus(record, currentMileage) : 'none'

  function handleDelete() {
    if (!record) return
    softDeleteRecord(record.id)
    setConfirmingDelete(false)
    onClose()
  }

  function handleClose() {
    setConfirmingDelete(false)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div style={{ padding: '0 20px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(108,99,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ServiceIcon type={record.type} size={26} color="#6c63ff" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0f0e17' }}>
              {SERVICE_TYPE_LABELS[record.type]}
            </div>
            {record.reminderEnabled && status !== 'none' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <ReminderDot status={status} />
                <span style={{ fontSize: 12, color: status === 'overdue' ? '#ef4444' : '#f59e0b', fontWeight: 500 }}>
                  {status === 'overdue' ? 'Prošlé' : 'Brzy'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div style={{ background: '#ffffff', borderRadius: 16, border: '0.5px solid rgba(0,0,0,0.08)', padding: '0 16px', marginBottom: 16 }}>
          <div style={rowStyle}>
            <span style={labelStyle}>Datum</span>
            <span style={valueStyle}>{formatDate(record.date)}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Km při servisu</span>
            <span style={valueStyle}>{formatMileage(record.mileage)}</span>
          </div>
          {record.cost != null && (
            <div style={rowStyle}>
              <span style={labelStyle}>Cena</span>
              <span style={valueStyle}>{record.cost.toLocaleString('cs-CZ')} Kč</span>
            </div>
          )}
          {record.garage && (
            <div style={rowStyle}>
              <span style={labelStyle}>Místo</span>
              <span style={valueStyle}>{record.garage}</span>
            </div>
          )}
          {record.notes && (
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>Poznámky</span>
              <span style={{ ...valueStyle, maxWidth: '70%' }}>{record.notes}</span>
            </div>
          )}
          {!record.cost && !record.garage && !record.notes && (
            <div style={{ ...rowStyle, borderBottom: 'none' }}><span /></div>
          )}
        </div>

        {/* Next service */}
        {record.reminderEnabled && (record.nextServiceDate || record.nextServiceMileage) && (
          <div style={{ background: '#ffffff', borderRadius: 16, border: '0.5px solid rgba(0,0,0,0.08)', padding: '0 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#5c6070', fontWeight: 500, padding: '12px 0 4px' }}>
              Příští servis
            </div>
            {record.nextServiceDate && (
              <div style={rowStyle}>
                <span style={labelStyle}>Datum</span>
                <span style={valueStyle}>{formatDate(record.nextServiceDate)}</span>
              </div>
            )}
            {record.nextServiceMileage && (
              <div style={{ ...rowStyle, borderBottom: 'none' }}>
                <span style={labelStyle}>Km</span>
                <span style={valueStyle}>{formatMileage(record.nextServiceMileage)}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {confirmingDelete ? (
          <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: 16, border: '1px solid rgba(239,68,68,0.2)', padding: 16 }}>
            <p style={{ fontSize: 14, color: '#0f0e17', marginBottom: 14, textAlign: 'center' as const }}>
              Opravdu smazat tento záznam?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, fontSize: 15, fontWeight: 600,
                  background: '#f0f0f5', color: '#5c6070', border: 'none',
                  touchAction: 'manipulation',
                }}
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, fontSize: 15, fontWeight: 600,
                  background: '#ef4444', color: 'white', border: 'none',
                  touchAction: 'manipulation',
                }}
              >
                Smazat
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => onEdit(record)}
              style={{
                flex: 1, padding: 14, borderRadius: 14, fontSize: 15, fontWeight: 600,
                background: '#f0f0f5', color: '#0f0e17',
                border: '0.5px solid rgba(0,0,0,0.10)',
                touchAction: 'manipulation',
              }}
            >
              Upravit
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              style={{
                flex: 1, padding: 14, borderRadius: 14, fontSize: 15, fontWeight: 600,
                background: 'transparent', color: '#ef4444',
                border: '1px solid #ef4444',
                touchAction: 'manipulation',
              }}
            >
              Smazat
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
