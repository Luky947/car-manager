import { useState, useEffect, useRef } from 'react'
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
import CarDetail from '../components/cars/CarDetail'

function animateNumber(
  from: number,
  to: number,
  duration: number,
  onUpdate: (val: number) => void
) {
  const start = performance.now()
  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    onUpdate(Math.round(from + (to - from) * eased))
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#444',
  marginBottom: 10,
}

export default function Dashboard() {
  const { cars, activeCar, setActiveCar } = useCarStore()
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)
  const documents = useDocumentStore(s => s.documents)
  const reminders = useReminders()
  const { openCarForm } = useFab()
  const navigate = useNavigate()
  const [carDetailOpen, setCarDetailOpen] = useState(false)

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

  const animatedCarId = useRef<string | null>(null)
  const [displayMileage, setDisplayMileage] = useState(0)
  const [displayConsumption, setDisplayConsumption] = useState(0)
  const [displayServiceCount, setDisplayServiceCount] = useState(0)

  useEffect(() => {
    if (!activeCar) return
    if (animatedCarId.current !== activeCar.id) {
      animatedCarId.current = activeCar.id
      animateNumber(0, mileage, 800, setDisplayMileage)
      animateNumber(0, Math.round(consumption * 10), 800, v => setDisplayConsumption(v / 10))
      animateNumber(0, serviceCount, 600, setDisplayServiceCount)
    } else {
      setDisplayMileage(mileage)
      setDisplayConsumption(consumption)
      setDisplayServiceCount(serviceCount)
    }
  }, [activeCar, mileage, consumption, serviceCount])

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
    <div style={{ padding: '56px 20px 32px', WebkitOverflowScrolling: 'touch' }}>

      {activeCar && (
        <>
          {/* Header — car name + cycle on tap */}
          <div
            style={{ marginBottom: 0, marginTop: 8, cursor: cars.length > 1 ? 'pointer' : 'default' }}
            onClick={() => {
              if (cars.length <= 1) return
              const idx = cars.findIndex(c => c.id === activeCar.id)
              setActiveCar(cars[(idx + 1) % cars.length])
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.02em', margin: '0 0 2px' }}>
                {activeCar.brand} {activeCar.model}
              </span>
              {cars.length > 1 && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </div>
            <div style={{ fontSize: 13, color: '#555', margin: 0 }}>
              {activeCar.year} · {activeCar.licensePlate} · {fuelTypeLabel[activeCar.fuelType]}
            </div>
          </div>

          {/* Hero — car on radial gradient spotlight */}
          <div style={{
            position: 'relative',
            width: '100vw',
            marginLeft: '-20px',
            height: '260px',
            background: 'radial-gradient(ellipse at 50% 70%, #2e2e2e 0%, #1a1a1a 45%, #0a0a0a 100%)',
            overflow: 'hidden',
            marginBottom: '24px',
          }}>
            {/* Spotlight */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80%',
              height: '60px',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Car */}
            <img
              src="/car-placeholder.png"
              alt="Auto"
              onClick={() => setCarDetailOpen(true)}
              style={{
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '110%',
                maxWidth: '420px',
                height: '220px',
                objectFit: 'contain',
                cursor: 'pointer',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))',
                transition: 'transform 150ms cubic-bezier(0.2,0,0,1)',
              }}
              onPointerDown={e => (e.currentTarget.style.transform = 'translateX(-50%) scale(0.97)')}
              onPointerUp={e => (e.currentTarget.style.transform = 'translateX(-50%)')}
              onPointerLeave={e => (e.currentTarget.style.transform = 'translateX(-50%)')}
            />

            {/* Bottom fade into page background */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            <div style={{ flex: 1, background: '#141414', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)', padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aktuální km</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0', lineHeight: 1 }}>{displayMileage.toLocaleString('cs-CZ')}</div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 3 }}>km</div>
              {lastMileageRecord && (
                <div style={{ fontSize: 11, color: '#555', marginTop: 4, whiteSpace: 'nowrap' }}>
                  {formatLastUpdate(lastMileageRecord.date)}
                </div>
              )}
            </div>
            <div style={{ flex: 1, background: '#141414', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)', padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Spotřeba</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0', lineHeight: 1 }}>{consumption > 0 ? displayConsumption.toFixed(1) : '–'}</div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 3 }}>l/100km</div>
            </div>
            <div style={{ flex: 1, background: '#141414', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.08)', padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Servis</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0', lineHeight: 1 }}>{displayServiceCount}</div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 3 }}>záznamů</div>
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
                      background: '#141414', borderRadius: 16,
                      border: '0.5px solid rgba(255,255,255,0.07)',
                      padding: '14px 16px', marginBottom: 8,
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

      <CarDetail
        car={activeCar ?? null}
        isOpen={carDetailOpen}
        onClose={() => setCarDetailOpen(false)}
        onEdit={() => {
          setCarDetailOpen(false)
          setTimeout(() => openCarForm(activeCar ?? undefined), 320)
        }}
      />
    </div>
  )
}
