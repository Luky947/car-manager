import { useState } from 'react'
import type { FuelRecord } from '../types'
import { useCarStore } from '../stores/useCarStore'
import { useFuelStore } from '../stores/useFuelStore'
import { calculateConsumption } from '../utils/calculations'
import { useFab } from '../context/FabContext'
import FuelCard from '../components/fuel/FuelCard'
import FuelDetail from '../components/fuel/FuelDetail'

export default function Fuel() {
  const activeCar = useCarStore(s => s.activeCar)
  const fuelRecords = useFuelStore(s => s.records)
  const { openFuelForm } = useFab()

  const [selectedRecord, setSelectedRecord] = useState<FuelRecord | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const carRecords = activeCar
    ? fuelRecords
        .filter(r => r.carId === activeCar.id && !r.deletedAt)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : []

  const allCarRecords = activeCar
    ? fuelRecords.filter(r => r.carId === activeCar.id)
    : []

  const consumption = activeCar ? calculateConsumption(allCarRecords) : 0
  const avgPpl = carRecords.length > 0
    ? carRecords.reduce((s, r) => s + r.pricePerLiter, 0) / carRecords.length
    : 0
  const totalLiters = carRecords.reduce((s, r) => s + r.liters, 0)
  const totalCost = carRecords.reduce((s, r) => s + r.totalCost, 0)

  function handleCardPress(record: FuelRecord) {
    setSelectedRecord(record)
    setDetailOpen(true)
  }

  function handleEdit(record: FuelRecord) {
    setDetailOpen(false)
    setTimeout(() => openFuelForm(record), 320)
  }

  const showStats = carRecords.length >= 2

  return (
    <div style={{ padding: '56px 20px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0' }}>Palivo</h1>
          {carRecords.length > 0 && (
            <span style={{ fontSize: 13, color: '#5c6070' }}>{carRecords.length} záznamů</span>
          )}
        </div>
        {totalCost > 0 && (
          <span style={{ fontSize: 13, color: '#9a9da8' }}>
            {totalCost.toLocaleString('cs-CZ')} Kč celkem
          </span>
        )}
      </div>

      {/* Stats strip */}
      {showStats && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Spotřeba', value: consumption > 0 ? consumption.toFixed(1) : '–', unit: 'l/100km' },
            { label: 'Prům. cena', value: avgPpl > 0 ? avgPpl.toFixed(2) : '–', unit: 'Kč/l' },
            { label: 'Natankováno', value: totalLiters.toFixed(0), unit: 'l' },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1, background: '#1e1d2e', borderRadius: 12,
              border: '0.5px solid rgba(255,255,255,0.06)',
              padding: '12px 10px', textAlign: 'center' as const,
            }}>
              <div style={{ fontSize: 10, color: '#5c6070', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{stat.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f0', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: '#5c6070', marginTop: 3 }}>{stat.unit}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!activeCar ? (
        <div style={{ textAlign: 'center', color: '#5c6070', padding: '40px 0' }}>Nejdřív přidej auto</div>
      ) : carRecords.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1e1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#5c6070" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16" /><path d="M3 22h12M14 10h2a2 2 0 012 2v3a1 1 0 001 1 1 1 0 001-1V8l-3-3" /><path d="M7 8h4M7 12h4" />
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f0', marginBottom: 6 }}>Žádné záznamy o tankování</div>
            <div style={{ fontSize: 13, color: '#9a9da8' }}>Přidej první tankování tlačítkem +</div>
          </div>
          <button
            type="button"
            onClick={() => openFuelForm()}
            style={{
              background: 'linear-gradient(135deg, #4f9eff, #6c63ff)',
              color: 'white', borderRadius: 14, padding: '12px 28px',
              fontSize: 15, fontWeight: 600, touchAction: 'manipulation',
            }}
          >
            Přidat tankování
          </button>
        </div>
      ) : (
        carRecords.map(r => (
          <FuelCard key={r.id} record={r} onPress={() => handleCardPress(r)} />
        ))
      )}

      <FuelDetail
        record={selectedRecord}
        allRecords={allCarRecords}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEdit}
      />
    </div>
  )
}
