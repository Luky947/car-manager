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
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1e1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            background: 'linear-gradient(135deg, #6c63ff, #4f9eff)',
            color: 'white',
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
    <div style={{ padding: '56px 20px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0' }}>Car Manager</div>
        {cars.length > 1 && (
          <select
            value={activeCar?.id ?? ''}
            onChange={e => {
              const car = cars.find(c => c.id === e.target.value)
              if (car) setActiveCar(car)
            }}
            style={{
              background: '#1e1d2e',
              color: '#f0f0f0',
              border: '0.5px solid rgba(255,255,255,0.10)',
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 500,
              outline: 'none',
            }}
          >
            {cars.map(c => (
              <option key={c.id} value={c.id}>{c.brand} {c.model}</option>
            ))}
          </select>
        )}
      </div>

      {activeCar && (
        <>
          {/* Active car */}
          <div style={{ marginBottom: 28 }}>
            <p style={sectionLabel}>Aktivní auto</p>
            <div style={{ background: '#1e1d2e', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.06)', padding: '20px 20px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <svg width="120" height="60" viewBox="0 0 240 120" fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ filter: 'drop-shadow(0 4px 16px rgba(108,99,255,0.3))' }}>
                  <path d="M20 80 L20 65 Q22 55 35 48 L70 32 Q85 24 105 22 L145 22 Q165 22 178 30 L205 48 Q218 55 220 65 L220 80 Z"
                    stroke="url(#carGradient)" strokeWidth="2.5"
                    fill="rgba(108,99,255,0.08)" strokeLinejoin="round"/>
                  <path d="M72 48 L88 28 Q100 22 120 22 L148 22 Q162 22 172 30 L190 48 Z"
                    stroke="url(#carGradient)" strokeWidth="2"
                    fill="rgba(79,158,255,0.12)" strokeLinejoin="round"/>
                  <path d="M210 58 L218 62 L218 70 L208 70"
                    stroke="#4f9eff" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M28 58 L20 62 L20 70 L30 70"
                    stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="175" cy="82" r="18" stroke="url(#carGradient)"
                    strokeWidth="2.5" fill="rgba(108,99,255,0.06)"/>
                  <circle cx="175" cy="82" r="8" stroke="url(#carGradient)"
                    strokeWidth="1.5" fill="rgba(108,99,255,0.15)"/>
                  <circle cx="68" cy="82" r="18" stroke="url(#carGradient)"
                    strokeWidth="2.5" fill="rgba(108,99,255,0.06)"/>
                  <circle cx="68" cy="82" r="8" stroke="url(#carGradient)"
                    strokeWidth="1.5" fill="rgba(108,99,255,0.15)"/>
                  <line x1="38" y1="80" x2="50" y2="80"
                    stroke="url(#carGradient)" strokeWidth="2"/>
                  <line x1="86" y1="80" x2="157" y2="80"
                    stroke="url(#carGradient)" strokeWidth="2"/>
                  <line x1="193" y1="80" x2="205" y2="80"
                    stroke="url(#carGradient)" strokeWidth="2"/>
                  <defs>
                    <linearGradient id="carGradient" x1="0" y1="0"
                      x2="240" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#6c63ff"/>
                      <stop offset="100%" stopColor="#4f9eff"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0', marginBottom: 4 }}>
                {activeCar.brand} {activeCar.model}
              </div>
              <div style={{ fontSize: 13, color: '#9a9da8' }}>
                {activeCar.year} · {activeCar.licensePlate} · {fuelTypeLabel[activeCar.fuelType]}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {[
              {
                label: 'Aktuální km',
                value: mileage.toLocaleString('cs-CZ'),
                unit: 'km',
                sub: lastMileageRecord ? formatLastUpdate(lastMileageRecord.date) : null,
              },
              { label: 'Spotřeba', value: consumption > 0 ? consumption.toFixed(1) : '–', unit: 'l/100km', sub: null },
              { label: 'Servis', value: serviceCount.toString(), unit: 'záznamů', sub: null },
            ].map(stat => (
              <div key={stat.label} style={{
                flex: 1, background: '#1e1d2e', borderRadius: 12,
                border: '0.5px solid rgba(255,255,255,0.06)',
                padding: '12px 10px', textAlign: 'center' as const,
              }}>
                <div style={{ fontSize: 10, color: '#5c6070', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{stat.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: '#5c6070', marginTop: 3 }}>{stat.unit}</div>
                {stat.sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{stat.sub}</div>}
              </div>
            ))}
          </div>

          {/* Reminders */}
          {urgentReminders.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={sectionLabel}>Připomínky</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {urgentReminders.map(r => {
                  const status = getReminderStatus(r, mileage)
                  return (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: '#1e1d2e',
                        borderRadius: 14,
                        border: '0.5px solid rgba(255,255,255,0.06)',
                        padding: '12px 16px',
                        marginBottom: 8,
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
              </div>
              <button
                onClick={() => navigate('/service')}
                style={{ fontSize: 13, color: '#6c63ff', fontWeight: 500, padding: '4px 0', marginTop: 4, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Zobrazit vše →
              </button>
            </div>
          )}

          {/* Expiring docs */}
          {expiringDocs.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{
                background: 'rgba(245,158,11,0.12)',
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
