import { useNavigate } from 'react-router-dom'
import { useCarStore } from '../stores/useCarStore'
import { useServiceStore } from '../stores/useServiceStore'
import { useFuelStore } from '../stores/useFuelStore'
import { useDocumentStore } from '../stores/useDocumentStore'
import { useReminders } from '../hooks/useReminders'
import { getCurrentMileage, calculateConsumption, getLastMileageRecord } from '../utils/calculations'
import { getReminderStatus } from '../utils/reminders'
import { formatMileage, formatDate, daysUntil } from '../utils/formatters'
import { fuelTypeLabel } from '../utils/labels'
import { SERVICE_TYPE_LABELS } from '../utils/serviceTypes'
import { useFab } from '../context/FabContext'
import ReminderDot from '../components/ui/ReminderDot'

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#5c6070',
  marginBottom: 12,
  fontWeight: 500,
}

export default function Dashboard() {
  const { cars, activeCar, setActiveCar } = useCarStore()
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)
  const documents = useDocumentStore(s => s.documents)
  const reminders = useReminders()
  const { openCarForm } = useFab()
  const navigate = useNavigate()

  const mileage = activeCar ? getCurrentMileage(activeCar, serviceRecords, fuelRecords) : 0

  const lastMileageRecord = activeCar
    ? getLastMileageRecord(serviceRecords, fuelRecords, activeCar.id)
    : null

  function formatLastUpdate(date: string): string {
    const d = new Date(date)
    const opts: Intl.DateTimeFormatOptions = d.getFullYear() === new Date().getFullYear()
      ? { day: 'numeric', month: 'numeric' }
      : { day: 'numeric', month: 'numeric', year: 'numeric' }
    return `aktualizováno ${d.toLocaleDateString('cs-CZ', opts)}`
  }

  const consumption = activeCar
    ? calculateConsumption(fuelRecords.filter(r => r.carId === activeCar.id))
    : 0

  const serviceCount = activeCar
    ? serviceRecords.filter(r => r.carId === activeCar.id && !r.deletedAt).length
    : 0

  const urgentReminders = reminders
    .filter(r => {
      const s = getReminderStatus(r, mileage)
      return s === 'overdue' || s === 'soon'
    })
    .slice(0, 3)

  const expiringDocs = documents.filter(d => {
    if (!d.expiryDate || d.deletedAt) return false
    return daysUntil(d.expiryDate) <= 30
  })

  if (cars.length === 0) {
    return (
      <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5c6070" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3M13 17l2 2 4-4M16 3h5v5M21 8v-5" />
            <path d="M7 17h2M14 9l2 2-4 4" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h4a2 2 0 002-2v-5l-3-5H5a2 2 0 00-2 2v8a2 2 0 002 2h1" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#f0f0f0', marginBottom: 8 }}>Žádné auto</div>
          <div style={{ fontSize: 14, color: '#9a9da8' }}>Přidej své první auto a začni sledovat historii</div>
        </div>
        <button
          onClick={() => openCarForm()}
          style={{
            background: '#e8e8e8',
            color: '#0a0a0a',
            borderRadius: 14,
            padding: '14px 32px',
            fontSize: 16,
            fontWeight: 600,
            touchAction: 'manipulation',
          }}
        >
          Přidat auto
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '56px 20px 32px' }}>

      {activeCar && (
        <>
          {/* Header — car name + selector */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#f0f0f0', lineHeight: 1.1 }}>
                {activeCar.brand} {activeCar.model}
              </div>
              <div style={{ fontSize: 14, color: '#5c6070', marginTop: 6 }}>
                {activeCar.year} · {activeCar.licensePlate} · {fuelTypeLabel[activeCar.fuelType]}
              </div>
            </div>
            {cars.length > 1 && (
              <select
                value={activeCar.id}
                onChange={e => {
                  const car = cars.find(c => c.id === e.target.value)
                  if (car) setActiveCar(car)
                }}
                style={{
                  background: '#161616',
                  color: '#f0f0f0',
                  border: '0.5px solid rgba(255,255,255,0.10)',
                  borderRadius: 10,
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 500,
                  outline: 'none',
                  flexShrink: 0,
                  marginTop: 4,
                }}
              >
                {cars.map(c => (
                  <option key={c.id} value={c.id}>{c.brand} {c.model}</option>
                ))}
              </select>
            )}
          </div>

          {/* Car image — floats on background */}
          <img
            src="/car-placeholder.png"
            alt="Auto"
            style={{
              width: '100%',
              maxHeight: 220,
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
            }}
          />

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            <div style={{ flex: 1, background: '#161616', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.06)', padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#5c6070', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aktuální km</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', lineHeight: 1 }}>{mileage.toLocaleString('cs-CZ')}</div>
              <div style={{ fontSize: 10, color: '#5c6070', marginTop: 3 }}>km</div>
              {lastMileageRecord && (
                <div style={{ fontSize: 11, color: '#5c6070', marginTop: 4, whiteSpace: 'nowrap' }}>
                  {formatLastUpdate(lastMileageRecord.date)}
                </div>
              )}
            </div>
            <div style={{ flex: 1, background: '#161616', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.06)', padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#5c6070', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Spotřeba</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', lineHeight: 1 }}>{consumption > 0 ? consumption.toFixed(1) : '–'}</div>
              <div style={{ fontSize: 10, color: '#5c6070', marginTop: 3 }}>l/100km</div>
            </div>
            <div style={{ flex: 1, background: '#161616', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.06)', padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#5c6070', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Servis</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', lineHeight: 1 }}>{serviceCount}</div>
              <div style={{ fontSize: 10, color: '#5c6070', marginTop: 3 }}>záznamů</div>
            </div>
          </div>

          {/* Reminders */}
          {urgentReminders.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={sectionLabel}>Připomínky</p>
              {urgentReminders.map(r => {
                const status = getReminderStatus(r, mileage)
                return (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: '#161616', borderRadius: 14,
                      border: '0.5px solid rgba(255,255,255,0.06)',
                      padding: '12px 16px', marginBottom: 8,
                    }}
                  >
                    <ReminderDot status={status} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#f0f0f0' }}>
                        {SERVICE_TYPE_LABELS[r.type]}
                      </div>
                      <div style={{ fontSize: 12, color: '#9a9da8', marginTop: 2 }}>
                        {r.nextServiceDate && `Do ${formatDate(r.nextServiceDate)}`}
                        {r.nextServiceMileage && ` · ${formatMileage(r.nextServiceMileage)}`}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: status === 'overdue' ? '#ef4444' : '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {status === 'overdue' ? 'Prošlé' : 'Brzy'}
                    </span>
                  </div>
                )
              })}
              <button
                onClick={() => navigate('/service')}
                style={{ fontSize: 13, color: '#e8e8e8', fontWeight: 500, padding: '4px 0', marginTop: 4, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Zobrazit vše →
              </button>
            </div>
          )}

          {/* Expiring docs */}
          {expiringDocs.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{
                background: 'rgba(245,158,11,0.15)',
                borderRadius: 14,
                border: '0.5px solid rgba(245,158,11,0.3)',
                padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>Dokumenty expirují</span>
                </div>
                {expiringDocs.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                    <span style={{ fontSize: 13, color: '#f0f0f0' }}>{doc.title}</span>
                    <span style={{ fontSize: 12, color: '#f59e0b' }}>
                      {doc.expiryDate && (daysUntil(doc.expiryDate) <= 0 ? 'Expirováno' : `za ${daysUntil(doc.expiryDate)} dní`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
