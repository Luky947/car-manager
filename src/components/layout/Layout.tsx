import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import BottomNav from './BottomNav'
import BottomSheet from '../ui/BottomSheet'
import CarForm from '../cars/CarForm'
import ServiceForm from '../service/ServiceForm'
import FuelForm from '../fuel/FuelForm'
import DocumentForm from '../documents/DocumentForm'
import { useFab } from '../../context/FabContext'

function FabChoiceSheet() {
  const { fabChoiceOpen, closeFabChoice, openServiceForm, openFuelForm } = useFab()

  function handleService() {
    closeFabChoice()
    setTimeout(() => openServiceForm(), 320)
  }

  function handleFuel() {
    closeFabChoice()
    setTimeout(() => openFuelForm(), 320)
  }

  return (
    <BottomSheet isOpen={fabChoiceOpen} onClose={closeFabChoice} title="Přidat záznam">
      <div style={{ padding: '8px 20px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          className="pressable-subtle"
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: 16, background: '#ffffff', borderRadius: 16,
            border: '0.5px solid rgba(0,0,0,0.08)',
          }}
          onClick={handleService}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0a0a0a' }}>Přidat servis</div>
            <div style={{ fontSize: 13, color: '#5c6070', marginTop: 2 }}>Servisní záznam nebo připomínku</div>
          </div>
        </button>

        <button
          className="pressable-subtle"
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: 16, background: '#ffffff', borderRadius: 16,
            border: '0.5px solid rgba(0,0,0,0.08)',
          }}
          onClick={handleFuel}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(79,158,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aaaaaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16" />
              <path d="M3 22h12M14 10h2a2 2 0 012 2v3a1 1 0 001 1 1 1 0 001-1V8l-3-3" />
              <path d="M7 8h4M7 12h4" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0a0a0a' }}>Přidat tankování</div>
            <div style={{ fontSize: 13, color: '#5c6070', marginTop: 2 }}>Záznam o tankování paliva</div>
          </div>
        </button>
      </div>
    </BottomSheet>
  )
}

export default function Layout() {
  const {
    carFormOpen, closeCarForm, editingCar,
    serviceFormOpen, closeServiceForm, editingService,
    fuelFormOpen, closeFuelForm, editingFuel,
    documentFormOpen, closeDocumentForm, editingDocument,
  } = useFab()

  const location = useLocation()
  const [pageVisible, setPageVisible] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const pullStartY = useRef(0)
  const isPulling = useRef(false)

  useEffect(() => {
    setPageVisible(false)
    const t = setTimeout(() => setPageVisible(true), 20)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <div
      id="app-root"
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        overscrollBehavior: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main
        ref={mainRef}
        style={{ flex: 1, paddingBottom: 80, overflowY: 'auto', position: 'relative' }}
        onTouchStart={e => {
          if ((mainRef.current?.scrollTop ?? 1) === 0) {
            pullStartY.current = e.touches[0].clientY
            isPulling.current = true
          }
        }}
        onTouchMove={e => {
          if (!isPulling.current) return
          const dy = e.touches[0].clientY - pullStartY.current
          if (dy > 0) setPullDistance(Math.min(dy, 80))
          else { isPulling.current = false; setPullDistance(0) }
        }}
        onTouchEnd={() => {
          isPulling.current = false
          setPullDistance(0)
        }}
      >
        {/* Pull-to-refresh indicator */}
        {pullDistance > 10 && (
          <div style={{
            position: 'absolute',
            top: Math.max(pullDistance - 40, 4),
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: Math.min(pullDistance / 60, 1),
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            <svg
              width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#555" strokeWidth="2" strokeLinecap="round"
              style={{ animation: 'spin 1s linear infinite' }}
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
        )}

        <div style={{
          opacity: pageVisible ? 1 : 0,
          transform: pageVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 280ms cubic-bezier(0.2,0,0,1), transform 280ms cubic-bezier(0.2,0,0,1)',
        }}>
          <Outlet />
        </div>
      </main>

      <BottomNav />

      <BottomSheet
        isOpen={carFormOpen}
        onClose={closeCarForm}
        title={editingCar ? 'Upravit auto' : 'Přidat auto'}
      >
        <CarForm car={editingCar ?? undefined} onClose={closeCarForm} />
      </BottomSheet>

      <ServiceForm
        record={editingService ?? undefined}
        isOpen={serviceFormOpen}
        onClose={closeServiceForm}
      />

      <FuelForm
        record={editingFuel ?? undefined}
        isOpen={fuelFormOpen}
        onClose={closeFuelForm}
      />

      <DocumentForm
        doc={editingDocument ?? undefined}
        isOpen={documentFormOpen}
        onClose={closeDocumentForm}
      />

      <FabChoiceSheet />
    </div>
  )
}
