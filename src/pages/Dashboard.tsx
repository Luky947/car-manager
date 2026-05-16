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
  const { openCarForm, openServiceForm, openFuelForm } = useFab()
  const navigate = useNavigate()
  const [carDetailOpen, setCarDetailOpen] = useState(false)
  const [remindersOpen, setRemindersOpen] = useState(false)
  const [documentsOpen, setDocumentsOpen] = useState(false)

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

  const allDocs = documents
    .filter(d => !d.deletedAt)
    .sort((a, b) => {
      if (!a.expiryDate && !b.expiryDate) return 0
      if (!a.expiryDate) return 1
      if (!b.expiryDate) return -1
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
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
    <div style={{ padding: '0 20px 32px', WebkitOverflowScrolling: 'touch' }}>

      {activeCar && (
        <>
          {/* Hero — full bleed with car name inside */}
          <div style={{
            position: 'relative',
            width: '100vw',
            marginLeft: '-20px',
            marginTop: '-20px',
            height: '320px',
            background: 'radial-gradient(ellipse at 50% 60%, #2e2e2e 0%, #1a1a1a 50%, #0a0a0a 100%)',
            overflow: 'hidden',
            marginBottom: '24px',
          }}>
            {/* Car name */}
            <div
              style={{
                position: 'absolute',
                top: 'calc(16px + env(safe-area-inset-top))',
                left: '20px',
                right: '20px',
                zIndex: 2,
                cursor: cars.length > 1 ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (cars.length <= 1) return
                const idx = cars.findIndex(c => c.id === activeCar.id)
                setActiveCar(cars[(idx + 1) % cars.length])
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ fontSize: 26, fontWeight: 700, color: '#f0f0f0', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                  {activeCar.brand} {activeCar.model}
                </p>
                {cars.length > 1 && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                {activeCar.year} · {activeCar.licensePlate} · {fuelTypeLabel[activeCar.fuelType]}
              </p>
            </div>

            {/* Spotlight */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '70%',
              height: '40px',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Car */}
            <img
              src="/car-placeholder.png"
              alt="Auto"
              onClick={() => setCarDetailOpen(true)}
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '115%',
                maxWidth: '440px',
                height: '240px',
                objectFit: 'contain',
                cursor: 'pointer',
                filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.9))',
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
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
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

          {/* Quick Actions 2×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {/* Add Service */}
            <button
              onClick={() => openServiceForm()}
              className="pressable"
              style={{
                background: '#141414',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 12,
                aspectRatio: '1',
                touchAction: 'manipulation',
              }}
            >
              <div style={{ width: 36, height: 36, background: '#1e1e1e', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0', textAlign: 'left' }}>Přidat servis</span>
            </button>

            {/* Add Fuel */}
            <button
              onClick={() => openFuelForm()}
              className="pressable"
              style={{
                background: '#141414',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 12,
                aspectRatio: '1',
                touchAction: 'manipulation',
              }}
            >
              <div style={{ width: 36, height: 36, background: '#1e1e1e', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h10v18H3z"/><path d="M13 7h2a2 2 0 012 2v3a2 2 0 002 2h0V7l-3-4"/><line x1="7" y1="8" x2="9" y2="8"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0', textAlign: 'left' }}>Přidat tankování</span>
            </button>

            {/* Reminders toggle */}
            <button
              onClick={() => setRemindersOpen(o => !o)}
              className="pressable"
              style={{
                background: remindersOpen ? '#f5f5f7' : '#141414',
                border: `0.5px solid ${remindersOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 12,
                aspectRatio: '1',
                touchAction: 'manipulation',
                transition: 'background 150ms, border-color 150ms',
              }}
            >
              <div style={{
                width: 36, height: 36,
                background: remindersOpen ? '#e8e8e8' : '#1e1e1e',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'background 150ms',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={remindersOpen ? '#0a0a0a' : '#e8e8e8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: remindersOpen ? '#0a0a0a' : '#f0f0f0', textAlign: 'left', transition: 'color 150ms' }}>Připomínky</span>
            </button>

            {/* Documents toggle */}
            <button
              onClick={() => setDocumentsOpen(o => !o)}
              className="pressable"
              style={{
                background: documentsOpen ? '#f5f5f7' : '#141414',
                border: `0.5px solid ${documentsOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 12,
                aspectRatio: '1',
                touchAction: 'manipulation',
                transition: 'background 150ms, border-color 150ms',
              }}
            >
              <div style={{
                width: 36, height: 36,
                background: documentsOpen ? '#e8e8e8' : '#1e1e1e',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'background 150ms',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={documentsOpen ? '#0a0a0a' : '#e8e8e8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: documentsOpen ? '#0a0a0a' : '#f0f0f0', textAlign: 'left', transition: 'color 150ms' }}>Dokumenty</span>
            </button>
          </div>

          {/* Accordion — Reminders (white card) */}
          <div style={{
            overflow: 'hidden',
            maxHeight: remindersOpen ? '500px' : '0px',
            margin: remindersOpen ? '0 20px 24px' : '0 20px 0',
            transition: remindersOpen
              ? 'max-height 420ms cubic-bezier(0.4,0,0.2,1)'
              : 'max-height 320ms cubic-bezier(0.4,0,1,1)',
          }}>
            <div style={{
              background: '#f5f5f7',
              borderRadius: 20,
              padding: 20,
              opacity: remindersOpen ? 1 : 0,
              transform: remindersOpen ? 'translateY(0)' : 'translateY(-8px)',
              transition: remindersOpen
                ? 'opacity 350ms cubic-bezier(0.4,0,0.2,1) 50ms, transform 350ms cubic-bezier(0.4,0,0.2,1) 50ms'
                : 'opacity 200ms cubic-bezier(0.4,0,0.2,1), transform 200ms cubic-bezier(0.4,0,0.2,1)',
            }}>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9a9da8', margin: '0 0 12px' }}>Připomínky</p>
              {urgentReminders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ color: '#22c55e', fontSize: 14, margin: 0 }}>✓ Žádné aktivní připomínky</p>
                </div>
              ) : (
                <>
                  {urgentReminders.map((r, i) => {
                    const status = getReminderStatus(r, mileage)
                    const statusColor = status === 'overdue' ? '#ef4444' : status === 'soon' ? '#f59e0b' : '#22c55e'
                    const statusLabel = status === 'overdue' ? 'PROŠLÉ' : status === 'soon' ? 'BRZY' : 'OK'
                    return (
                      <div
                        key={r.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: i < urgentReminders.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ReminderDot status={status} />
                          <div>
                            <div style={{ fontSize: 14, color: '#0f0e17', fontWeight: 500 }}>{SERVICE_TYPE_LABELS[r.type]}</div>
                            {(r.nextServiceDate || r.nextServiceMileage) && (
                              <div style={{ fontSize: 12, color: '#9a9da8', marginTop: 2 }}>
                                {r.nextServiceDate && `Do ${formatDate(r.nextServiceDate)}`}
                                {r.nextServiceMileage && ` · ${formatMileage(r.nextServiceMileage)}`}
                              </div>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>{statusLabel}</span>
                      </div>
                    )
                  })}
                  <div style={{ marginTop: 12, textAlign: 'right' }}>
                    <button
                      onClick={() => navigate('/service')}
                      style={{ fontSize: 13, color: '#6c63ff', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Zobrazit vše →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Accordion — Documents (white card) */}
          <div style={{
            overflow: 'hidden',
            maxHeight: documentsOpen ? '500px' : '0px',
            margin: documentsOpen ? '0 20px 24px' : '0 20px 0',
            transition: documentsOpen
              ? 'max-height 420ms cubic-bezier(0.4,0,0.2,1)'
              : 'max-height 320ms cubic-bezier(0.4,0,1,1)',
          }}>
            <div style={{
              background: '#f5f5f7',
              borderRadius: 20,
              padding: 20,
              opacity: documentsOpen ? 1 : 0,
              transform: documentsOpen ? 'translateY(0)' : 'translateY(-8px)',
              transition: documentsOpen
                ? 'opacity 350ms cubic-bezier(0.4,0,0.2,1) 50ms, transform 350ms cubic-bezier(0.4,0,0.2,1) 50ms'
                : 'opacity 200ms cubic-bezier(0.4,0,0.2,1), transform 200ms cubic-bezier(0.4,0,0.2,1)',
            }}>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9a9da8', margin: '0 0 12px' }}>Dokumenty</p>
              {allDocs.length === 0 ? (
                <p style={{ color: '#22c55e', fontSize: 14, textAlign: 'center', margin: 0 }}>✓ Žádné expirující dokumenty</p>
              ) : (
                <>
                  {allDocs.map((doc, i) => {
                    const days = doc.expiryDate ? daysUntil(doc.expiryDate) : null
                    const color = days === null ? '#9a9da8' : days <= 0 ? '#ef4444' : days <= 30 ? '#f59e0b' : '#22c55e'
                    const label = days === null ? 'bez expirace' : days <= 0 ? 'Expirováno' : days <= 30 ? `za ${days} dní` : formatDate(doc.expiryDate!)
                    return (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: i < allDocs.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: 14, color: '#0f0e17', fontWeight: 500 }}>{doc.title}</span>
                        <span style={{ fontSize: 12, color, fontWeight: 500 }}>{label}</span>
                      </div>
                    )
                  })}
                  <div style={{ marginTop: 12, textAlign: 'right' }}>
                    <button
                      onClick={() => navigate('/documents')}
                      style={{ fontSize: 13, color: '#6c63ff', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Zobrazit vše →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
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
