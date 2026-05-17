import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useCarStore } from '../stores/useCarStore'
import { useServiceStore } from '../stores/useServiceStore'
import { useFuelStore } from '../stores/useFuelStore'
import { useDocumentStore } from '../stores/useDocumentStore'
import { getCurrentMileage, calculateConsumption, getLastMileageRecord, getYearlyMileage, filterRecordsByPeriod, calculateServiceCosts } from '../utils/calculations'
import type { CostPeriod } from '../utils/calculations'
import { getReminderStatus } from '../utils/reminders'
import { formatMileage, formatDate, daysUntil } from '../utils/formatters'
import { fuelTypeLabel } from '../utils/labels'
import { SERVICE_TYPE_LABELS } from '../utils/serviceTypes'
import { useFab } from '../context/FabContext'
import { usePressable } from '../hooks/usePressable'
import ReminderDot from '../components/ui/ReminderDot'
import BottomSheet from '../components/ui/BottomSheet'
import CarDetail from '../components/cars/CarDetail'
import CenterModal from '../components/ui/CenterModal'

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


const WINE_BORDER_NORMAL = 'linear-gradient(#141414, #141414) padding-box, linear-gradient(160deg, #4a0f1c 0%, #7a1a30 40%, #5c1222 70%, #3d0c18 100%) border-box'
const WINE_BORDER_ACTIVE = 'linear-gradient(#1e1010, #1e1010) padding-box, linear-gradient(160deg, #9e2d47 0%, #c4436a 35%, #9e2d47 70%, #6b1228 100%) border-box'

function ActionTile({ label, onClick, children, active = false, dimmed = false }: {
  label: string
  onClick: () => void
  children: React.ReactNode
  active?: boolean
  dimmed?: boolean
}) {
  const { handlers, pressed } = usePressable(onClick)

  return (
    <button
      type="button"
      {...handlers}
      style={{
        background: active ? WINE_BORDER_ACTIVE : WINE_BORDER_NORMAL,
        border: '1.5px solid transparent',
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        height: 64,
        touchAction: 'manipulation',
        opacity: dimmed ? 0.5 : pressed ? 0.85 : 1,
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        boxShadow: pressed
          ? '0 0 16px rgba(122,26,48,0.25)'
          : active
            ? '0 0 20px rgba(122,26,48,0.2)'
            : '0 0 12px rgba(122,26,48,0.12)',
        transition: pressed
          ? 'transform 60ms cubic-bezier(0.2,0,0,1), opacity 60ms, box-shadow 60ms'
          : 'transform 300ms cubic-bezier(0.34,1.56,0.64,1), opacity 200ms, box-shadow 200ms',
      }}
    >
      <div style={{ width: 36, height: 36, background: '#1a1a1a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {children}
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0', lineHeight: 1.2, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </button>
  )
}

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

export default function Dashboard() {
  const { cars, activeCar, setActiveCar } = useCarStore()
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)
  const documents = useDocumentStore(s => s.documents)
  const { openCarForm, openServiceForm, openFuelForm } = useFab()
  const location = useLocation()
  const [carDetailOpen, setCarDetailOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<'stats' | 'nextService' | 'insurance' | 'expenses' | null>(null)
  const [expensePeriod, setExpensePeriod] = useState<CostPeriod>('year')
  const [headlightsOn, setHeadlightsOn] = useState(false)

  useEffect(() => {
    if (location.pathname !== '/') return
    let cancelled = false
    async function welcomeBlink() {
      await delay(600)
      if (cancelled) return
      setHeadlightsOn(true)
      await delay(180)
      if (cancelled) return
      setHeadlightsOn(false)
      await delay(120)
      if (cancelled) return
      setHeadlightsOn(true)
      await delay(220)
      if (cancelled) return
      setHeadlightsOn(false)
    }
    welcomeBlink()
    return () => { cancelled = true }
  }, [location.pathname])

  const mileage = activeCar ? getCurrentMileage(activeCar, serviceRecords, fuelRecords) : 0

  const lastMileageRecord = activeCar
    ? getLastMileageRecord(serviceRecords, fuelRecords, activeCar.id)
    : null

  function formatLastUpdate(date: string): string {
    const d = new Date(date)
    const opts: Intl.DateTimeFormatOptions = d.getFullYear() === new Date().getFullYear()
      ? { day: 'numeric', month: 'numeric' }
      : { day: 'numeric', month: 'numeric', year: 'numeric' }
    return `· aktualizováno ${d.toLocaleDateString('cs-CZ', opts)}`
  }

  const consumption = activeCar
    ? calculateConsumption(fuelRecords.filter(r => r.carId === activeCar.id))
    : 0

  const yearlyMileage = activeCar
    ? getYearlyMileage(serviceRecords, fuelRecords, activeCar.id)
    : 0

  const animatedCarId = useRef<string | null>(null)
  const [displayMileage, setDisplayMileage] = useState(0)
  const [displayConsumption, setDisplayConsumption] = useState(0)
  const [displayYearlyMileage, setDisplayYearlyMileage] = useState(0)

  useEffect(() => {
    if (!activeCar) return
    if (animatedCarId.current !== activeCar.id) {
      animatedCarId.current = activeCar.id
      animateNumber(0, mileage, 800, setDisplayMileage)
      animateNumber(0, Math.round(consumption * 10), 800, v => setDisplayConsumption(v / 10))
      animateNumber(0, yearlyMileage, 700, setDisplayYearlyMileage)
    } else {
      setDisplayMileage(mileage)
      setDisplayConsumption(consumption)
      setDisplayYearlyMileage(yearlyMileage)
    }
  }, [activeCar, mileage, consumption, yearlyMileage])

  const allCarServiceRecords = activeCar
    ? serviceRecords.filter(r => r.carId === activeCar.id && !r.deletedAt)
    : []

  const allCarFuelRecords = activeCar
    ? fuelRecords.filter(r => r.carId === activeCar.id && !r.deletedAt)
    : []

  // Stats modal data
  const statsServiceCosts = calculateServiceCosts(filterRecordsByPeriod(allCarServiceRecords, 'year'))
  const statsFuelCost = allCarFuelRecords
    .filter(r => new Date(r.date).getFullYear() === new Date().getFullYear())
    .reduce((s, r) => s + r.totalCost, 0)

  // Next service modal data
  const nextServiceRecord = allCarServiceRecords
    .filter(r => r.reminderEnabled && (r.nextServiceDate || r.nextServiceMileage))
    .sort((a, b) => {
      const dateA = a.nextServiceDate ? new Date(a.nextServiceDate).getTime() : Infinity
      const dateB = b.nextServiceDate ? new Date(b.nextServiceDate).getTime() : Infinity
      return dateA - dateB
    })[0] ?? null

  // Insurance/STK modal data
  const insuranceTypes = ['insurance', 'registration', 'technical_inspection', 'emission_test']
  const insuranceServiceItems = allCarServiceRecords
    .filter(r => insuranceTypes.includes(r.type) && r.nextServiceDate)
    .map(r => ({ label: SERVICE_TYPE_LABELS[r.type], date: r.nextServiceDate!, days: daysUntil(r.nextServiceDate!) }))
  const insuranceDocItems = documents
    .filter(d => !d.deletedAt && d.carId === activeCar?.id && ['insurance', 'registration'].includes(d.type) && d.expiryDate)
    .map(d => ({ label: d.title, date: d.expiryDate!, days: daysUntil(d.expiryDate!) }))
  const insuranceItems = [...insuranceServiceItems, ...insuranceDocItems]
    .sort((a, b) => a.days - b.days)

  // Expenses modal data
  function getFuelCostForPeriod(period: CostPeriod): number {
    const now = new Date()
    return allCarFuelRecords.filter(r => {
      const d = new Date(r.date)
      if (period === 'year') return d.getFullYear() === now.getFullYear()
      if (period === '12months') {
        const ago = new Date(now); ago.setMonth(now.getMonth() - 12)
        return d >= ago
      }
      return true
    }).reduce((s, r) => s + r.totalCost, 0)
  }
  function getExpenseMonths(period: CostPeriod): number {
    if (period === 'year') return new Date().getMonth() + 1
    if (period === '12months') return 12
    return Math.max(1, Math.ceil(
      (new Date().getTime() - Math.min(
        ...[...allCarServiceRecords, ...allCarFuelRecords].map(r => new Date(r.date).getTime())
      )) / (1000 * 60 * 60 * 24 * 30)
    ))
  }

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
    <div style={{ paddingTop: 'env(safe-area-inset-top)', paddingLeft: 20, paddingRight: 20, paddingBottom: 32, WebkitOverflowScrolling: 'touch' }}>

      {activeCar && (
        <>
          {/* Hero — full bleed with car name inside */}
          <div style={{
            position: 'relative',
            width: '100vw',
            marginLeft: '-20px',
            marginTop: 'calc(-1 * env(safe-area-inset-top))',
            height: '320px',
            background: 'radial-gradient(ellipse at 50% 60%, #2e2e2e 0%, #1a1a1a 50%, #0a0a0a 100%)',
            overflow: 'hidden',
            marginBottom: '24px',
          }}>
            {/* Car name */}
            <div
              style={{
                position: 'absolute',
                top: 'calc(env(safe-area-inset-top) + 12px)',
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
            <div
              onClick={() => setCarDetailOpen(true)}
              style={{
                position: 'absolute',
                bottom: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '115%',
                maxWidth: '440px',
                height: '240px',
                cursor: 'pointer',
                transition: 'transform 150ms cubic-bezier(0.2,0,0,1)',
              }}
              onPointerDown={e => (e.currentTarget.style.transform = 'translateX(-50%) scale(0.97)')}
              onPointerUp={e => (e.currentTarget.style.transform = 'translateX(-50%)')}
              onPointerLeave={e => (e.currentTarget.style.transform = 'translateX(-50%)')}
            >
              <img
                src="/car-placeholder.png"
                alt="Auto"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.9))',
                }}
              />
              <img
                src="/car-on.png"
                alt=""
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  opacity: headlightsOn ? 1 : 0,
                  transition: headlightsOn ? 'opacity 40ms ease' : 'opacity 60ms ease',
                  filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.9))',
                }}
              />
            </div>

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
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                {
                  value: displayMileage.toLocaleString('cs-CZ'),
                  suffix: 'km',
                  label: 'CELK. NÁJEZD',
                  showSuffix: true,
                },
                {
                  value: consumption > 0 ? displayConsumption.toFixed(1) : '–',
                  suffix: 'l',
                  label: 'PRŮM. SPOTŘEBA',
                  showSuffix: consumption > 0,
                },
                {
                  value: yearlyMileage > 0 ? displayYearlyMileage.toLocaleString('cs-CZ') : '–',
                  suffix: 'km',
                  label: 'NÁJEZD LETOS',
                  showSuffix: yearlyMileage > 0,
                },
              ].map(stat => (
                <div key={stat.label} style={{
                  flex: 1,
                  background: 'linear-gradient(145deg, #1a1a1a, #111111)',
                  borderRadius: 16,
                  border: '0.5px solid rgba(255,255,255,0.10)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.04), inset -1px 0 0 rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.4)',
                  padding: '18px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 100,
                  textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.02em' }}>
                      {stat.value}
                    </span>
                    {stat.showSuffix && (
                      <span style={{ fontSize: 11, fontWeight: 400, color: '#555', marginLeft: 2 }}>
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.05em', margin: '6px 0 0', whiteSpace: 'nowrap' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            {lastMileageRecord && (
              <div style={{ fontSize: 11, color: '#666', textAlign: 'right', marginTop: 6, paddingRight: 4, fontWeight: 400 }}>
                {formatLastUpdate(lastMileageRecord.date)}
              </div>
            )}
          </div>

          {/* Quick Actions 2×3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>

            {/* 1 — Přidat servis */}
            <ActionTile label="Přidat servis" onClick={() => openServiceForm()} dimmed={activeModal !== null}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
              </svg>
            </ActionTile>

            {/* 2 — Přidat tankování */}
            <ActionTile label="Přidat tankování" onClick={() => openFuelForm()} dimmed={activeModal !== null}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16"/><path d="M3 22h12M14 10h2a2 2 0 012 2v3a1 1 0 001 1 1 1 0 001-1V8l-3-3"/>
                <path d="M7 8h4M7 12h4"/>
              </svg>
            </ActionTile>

            {/* 3 — Statistiky */}
            <ActionTile label="Statistiky" onClick={() => setActiveModal(m => m === 'stats' ? null : 'stats')} active={activeModal === 'stats'} dimmed={activeModal !== null && activeModal !== 'stats'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </ActionTile>

            {/* 4 — Příští servis */}
            <ActionTile label="Příští servis" onClick={() => setActiveModal(m => m === 'nextService' ? null : 'nextService')} active={activeModal === 'nextService'} dimmed={activeModal !== null && activeModal !== 'nextService'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                <path d="M9 16l2 2 4-4"/>
              </svg>
            </ActionTile>

            {/* 5 — Pojištění / STK */}
            <ActionTile label="Pojištění / STK" onClick={() => setActiveModal(m => m === 'insurance' ? null : 'insurance')} active={activeModal === 'insurance'} dimmed={activeModal !== null && activeModal !== 'insurance'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </ActionTile>

            {/* 6 — Výdaje */}
            <ActionTile label="Výdaje" onClick={() => setActiveModal(m => m === 'expenses' ? null : 'expenses')} active={activeModal === 'expenses'} dimmed={activeModal !== null && activeModal !== 'expenses'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </ActionTile>
          </div>

          {/* Statistiky modal */}
          <CenterModal isOpen={activeModal === 'stats'} onClose={() => setActiveModal(null)} title="Statistiky">
            {[
              { label: 'Servis (letos)', value: statsServiceCosts.service > 0 ? `${statsServiceCosts.service.toLocaleString('cs-CZ')} Kč` : '–' },
              { label: 'Pojištění & STK (letos)', value: statsServiceCosts.insurance > 0 ? `${statsServiceCosts.insurance.toLocaleString('cs-CZ')} Kč` : '–' },
              { label: 'Palivo (letos)', value: statsFuelCost > 0 ? `${statsFuelCost.toLocaleString('cs-CZ')} Kč` : '–' },
              { label: 'Celkem (letos)', value: (statsServiceCosts.total + statsFuelCost) > 0 ? `${(statsServiceCosts.total + statsFuelCost).toLocaleString('cs-CZ')} Kč` : '–', bold: true },
              { label: 'Průměrná spotřeba', value: consumption > 0 ? `${consumption.toFixed(1)} l/100km` : '–' },
              { label: 'Nájezd letos', value: yearlyMileage > 0 ? formatMileage(yearlyMileage) : '–' },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                <span style={{ fontSize: 14, color: '#555' }}>{row.label}</span>
                <span style={{ fontSize: 14, color: '#0a0a0a', fontWeight: row.bold ? 700 : 500 }}>{row.value}</span>
              </div>
            ))}
          </CenterModal>

          {/* Příští servis modal */}
          <CenterModal isOpen={activeModal === 'nextService'} onClose={() => setActiveModal(null)} title="Příští servis">
            {!nextServiceRecord ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <div style={{ fontSize: 15, color: '#0a0a0a', fontWeight: 500, marginTop: 12 }}>Žádný plánovaný servis</div>
              </div>
            ) : (() => {
              const status = getReminderStatus(nextServiceRecord, mileage)
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#0a0a0a' }}>{SERVICE_TYPE_LABELS[nextServiceRecord.type]}</div>
                    {status !== 'none' && <ReminderDot status={status} />}
                  </div>
                  {nextServiceRecord.nextServiceDate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, color: '#555' }}>Datum</span>
                      <span style={{ fontSize: 14, color: '#0a0a0a', fontWeight: 500 }}>{formatDate(nextServiceRecord.nextServiceDate)}</span>
                    </div>
                  )}
                  {nextServiceRecord.nextServiceMileage && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, color: '#555' }}>Při km</span>
                      <span style={{ fontSize: 14, color: '#0a0a0a', fontWeight: 500 }}>{formatMileage(nextServiceRecord.nextServiceMileage)}</span>
                    </div>
                  )}
                  {nextServiceRecord.nextServiceDate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, color: '#555' }}>Za</span>
                      <span style={{ fontSize: 14, color: daysUntil(nextServiceRecord.nextServiceDate) < 0 ? '#ef4444' : daysUntil(nextServiceRecord.nextServiceDate) <= 30 ? '#f59e0b' : '#22c55e', fontWeight: 500 }}>
                        {daysUntil(nextServiceRecord.nextServiceDate) < 0 ? `prošlé o ${Math.abs(daysUntil(nextServiceRecord.nextServiceDate))} dní` : `${daysUntil(nextServiceRecord.nextServiceDate)} dní`}
                      </span>
                    </div>
                  )}
                </div>
              )
            })()}
          </CenterModal>

          {/* Pojištění / STK modal */}
          <CenterModal isOpen={activeModal === 'insurance'} onClose={() => setActiveModal(null)} title="Pojištění & STK">
            {insuranceItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <div style={{ fontSize: 15, color: '#0a0a0a', fontWeight: 500, marginTop: 12 }}>Vše v pořádku</div>
              </div>
            ) : insuranceItems.map((item, i) => {
              const color = item.days < 0 ? '#ef4444' : item.days <= 30 ? '#f59e0b' : item.days <= 60 ? 'rgba(202,138,4,0.8)' : '#22c55e'
              const daysLabel = item.days < 0 ? `prošlé o ${Math.abs(item.days)} dní` : item.days === 0 ? 'dnes' : `za ${item.days} dní`
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < insuranceItems.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#0a0a0a', fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#9a9da8', marginTop: 2 }}>{formatDate(item.date)}</div>
                  </div>
                  <span style={{ fontSize: 12, color, fontWeight: 500 }}>{daysLabel}</span>
                </div>
              )
            })}
          </CenterModal>

          {/* Výdaje modal */}
          <CenterModal isOpen={activeModal === 'expenses'} onClose={() => setActiveModal(null)} title="Výdaje">
            {/* Segmented control */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.06)', borderRadius: 10, padding: 2, marginBottom: 16, gap: 2 }}>
              {([['year', 'Tento rok'], ['12months', '12 měsíců'], ['all', 'Vše']] as [CostPeriod, string][]).map(([val, lbl]) => (
                <button key={val} onClick={() => setExpensePeriod(val)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 13, fontWeight: expensePeriod === val ? 600 : 400, color: expensePeriod === val ? '#0a0a0a' : '#555', background: expensePeriod === val ? '#fff' : 'transparent', boxShadow: expensePeriod === val ? '0 1px 3px rgba(0,0,0,0.12)' : 'none', transition: 'all 200ms' }}>{lbl}</button>
              ))}
            </div>
            {(() => {
              const svcRecords = filterRecordsByPeriod(allCarServiceRecords, expensePeriod)
              const svcCosts = calculateServiceCosts(svcRecords)
              const fuelCost = getFuelCostForPeriod(expensePeriod)
              const total = svcCosts.total + fuelCost
              const months = getExpenseMonths(expensePeriod)
              const avgMonthly = months > 0 ? Math.round(total / months) : 0
              return (
                <>
                  {[
                    { label: 'Servis', value: svcCosts.service },
                    { label: 'Pojištění & STK', value: svcCosts.insurance },
                    { label: 'Ostatní', value: svcCosts.other },
                    { label: 'Palivo', value: fuelCost },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: 14, color: '#555' }}>{row.label}</span>
                      <span style={{ fontSize: 14, color: '#0a0a0a', fontWeight: 500 }}>{row.value > 0 ? `${row.value.toLocaleString('cs-CZ')} Kč` : '–'}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px', borderTop: '0.5px solid rgba(0,0,0,0.12)', marginTop: 2 }}>
                    <span style={{ fontSize: 16, color: '#0a0a0a', fontWeight: 700 }}>Celkem</span>
                    <span style={{ fontSize: 16, color: '#0a0a0a', fontWeight: 700 }}>{total > 0 ? `${total.toLocaleString('cs-CZ')} Kč` : '–'}</span>
                  </div>
                  {total > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 4 }}>
                      <span style={{ fontSize: 13, color: '#9a9da8' }}>Průměrně / měsíc</span>
                      <span style={{ fontSize: 13, color: '#9a9da8' }}>{avgMonthly.toLocaleString('cs-CZ')} Kč</span>
                    </div>
                  )}
                </>
              )
            })()}
          </CenterModal>
        </>
      )}

      <BottomSheet
        isOpen={carDetailOpen}
        onClose={() => setCarDetailOpen(false)}
        title="Detail auta"
      >
        <CarDetail
          car={activeCar ?? null}
          onEdit={() => {
            setCarDetailOpen(false)
            setTimeout(() => openCarForm(activeCar ?? undefined), 320)
          }}
        />
      </BottomSheet>
    </div>
  )
}
