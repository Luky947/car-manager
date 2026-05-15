import { Outlet } from 'react-router-dom'
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
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: 16, background: '#ffffff', borderRadius: 16,
            border: '0.5px solid rgba(0,0,0,0.08)', touchAction: 'manipulation',
          }}
          onClick={handleService}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0f0e17' }}>Přidat servis</div>
            <div style={{ fontSize: 13, color: '#5c6070', marginTop: 2 }}>Servisní záznam nebo připomínku</div>
          </div>
        </button>

        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: 16, background: '#ffffff', borderRadius: 16,
            border: '0.5px solid rgba(0,0,0,0.08)', touchAction: 'manipulation',
          }}
          onClick={handleFuel}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(79,158,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f9eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16" />
              <path d="M3 22h12M14 10h2a2 2 0 012 2v3a1 1 0 001 1 1 1 0 001-1V8l-3-3" />
              <path d="M7 8h4M7 12h4" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0f0e17' }}>Přidat tankování</div>
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

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        overscrollBehavior: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main style={{ flex: 1, paddingBottom: 80, overflowY: 'auto' }}>
        <Outlet />
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
