import { useCarStore } from '../stores/useCarStore'
import { useFab } from '../context/FabContext'
import CarCard from '../components/cars/CarCard'

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#5c6070',
  marginBottom: 12,
  fontWeight: 500,
}

export default function Settings() {
  const cars = useCarStore(s => s.cars)
  const { openCarForm } = useFab()

  return (
    <div style={{ padding: '56px 20px 20px' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0', marginBottom: 24 }}>
        Nastavení
      </div>

      {/* Cars section */}
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabel}>Auta</p>

        {cars.map(car => (
          <CarCard key={car.id} car={car} onPress={() => openCarForm(car)} />
        ))}

        <button
          type="button"
          onClick={() => openCarForm()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            background: 'transparent',
            border: '1px dashed rgba(255,255,255,0.15)',
            borderRadius: 14,
            padding: '14px 16px',
            fontSize: 14,
            fontWeight: 500,
            color: '#6c63ff',
            touchAction: 'manipulation',
            cursor: 'pointer',
            transition: 'opacity 150ms',
          }}
          onPointerDown={e => (e.currentTarget.style.opacity = '0.7')}
          onPointerUp={e => (e.currentTarget.style.opacity = '1')}
          onPointerLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Přidat auto
        </button>
      </div>

      {/* Placeholder sections */}
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabel}>Aplikace</p>
        <div style={{ background: '#1e1d2e', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          {[
            { label: 'Oznámení', note: 'Milestone 5' },
            { label: 'Záloha dat', note: 'Milestone 6' },
            { label: 'Google Drive', note: 'Milestone 6' },
          ].map(({ label, note }, i, arr) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: i < arr.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
                opacity: 0.5,
              }}
            >
              <span style={{ fontSize: 14, color: '#f0f0f0' }}>{label}</span>
              <span style={{ fontSize: 12, color: '#5c6070' }}>{note}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 12, color: '#3a3d47', paddingTop: 8 }}>
        Car Manager · Milestone 2
      </div>
    </div>
  )
}
