import { useCarStore } from '../stores/useCarStore'
import { useServiceStore } from '../stores/useServiceStore'
import { useFuelStore } from '../stores/useFuelStore'
import { getCurrentMileage } from '../utils/calculations'
import { getReminderStatus } from '../utils/reminders'
import { formatMileage, formatDate } from '../utils/formatters'
import { serviceTypeLabel } from '../utils/labels'
import ReminderDot from '../components/ui/ReminderDot'
import Badge from '../components/ui/Badge'

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#5c6070',
  marginBottom: 12,
  fontWeight: 500,
}

export default function Service() {
  const activeCar = useCarStore(s => s.activeCar)
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)

  const carRecords = activeCar
    ? serviceRecords
        .filter(r => r.carId === activeCar.id && !r.deletedAt)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : []

  const mileage = activeCar ? getCurrentMileage(activeCar, serviceRecords, fuelRecords) : 0

  return (
    <div style={{ padding: '56px 20px 20px' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0', marginBottom: 24 }}>
        Servisní záznamy
      </div>

      {!activeCar ? (
        <div style={{ textAlign: 'center', color: '#5c6070', padding: '40px 0' }}>
          Nejdřív přidej auto
        </div>
      ) : carRecords.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#5c6070', padding: '40px 0' }}>
          Žádné servisní záznamy
        </div>
      ) : (
        <>
          <p style={sectionLabel}>{carRecords.length} záznamů</p>
          {carRecords.map(r => {
            const status = r.reminderEnabled ? getReminderStatus(r, mileage) : 'none'
            return (
              <div
                key={r.id}
                style={{
                  background: '#1e1d2e',
                  borderRadius: 14,
                  border: '0.5px solid rgba(255,255,255,0.06)',
                  padding: '14px 16px',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r.reminderEnabled && <ReminderDot status={status} />}
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0' }}>
                      {serviceTypeLabel[r.type]}
                    </span>
                  </div>
                  {r.cost != null && (
                    <Badge label={`${r.cost.toLocaleString('cs-CZ')} Kč`} color="default" />
                  )}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5c6070" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span style={{ fontSize: 12, color: '#9a9da8' }}>{formatDate(r.date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5c6070" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span style={{ fontSize: 12, color: '#9a9da8' }}>{formatMileage(r.mileage)}</span>
                  </div>
                  {r.garage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5c6070" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span style={{ fontSize: 12, color: '#9a9da8' }}>{r.garage}</span>
                    </div>
                  )}
                </div>
                {(r.nextServiceDate || r.nextServiceMileage) && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid rgba(255,255,255,0.06)', fontSize: 12, color: '#5c6070' }}>
                    Příští: {r.nextServiceDate && formatDate(r.nextServiceDate)}{r.nextServiceDate && r.nextServiceMileage && ' nebo '}{r.nextServiceMileage && formatMileage(r.nextServiceMileage)}
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
