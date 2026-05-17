import { useState } from 'react'
import type { ServiceRecord } from '../types'
import { useCarStore } from '../stores/useCarStore'
import { useServiceStore } from '../stores/useServiceStore'
import { useFuelStore } from '../stores/useFuelStore'
import { getCurrentMileage, filterRecordsByPeriod, calculateServiceCosts } from '../utils/calculations'
import type { CostPeriod } from '../utils/calculations'
import { SERVICE_GROUPS } from '../utils/serviceTypes'
import { useFab } from '../context/FabContext'
import SegmentedControl from '../components/ui/SegmentedControl'
import ServiceCard from '../components/service/ServiceCard'
import ServiceDetail from '../components/service/ServiceDetail'

const filterOptions = [
  { label: 'Vše', value: 'all' },
  { label: 'Servis', value: 'service' },
  { label: 'Pojištění', value: 'docs' },
  { label: 'Ostatní', value: 'other' },
]

const periodOptions = [
  { label: 'Vše', value: 'all' },
  { label: 'Tento rok', value: 'year' },
  { label: '12 měsíců', value: '12months' },
]

export default function Service() {
  const activeCar = useCarStore(s => s.activeCar)
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)
  const { openServiceForm } = useFab()

  const [filter, setFilter] = useState('all')
  const [period, setPeriod] = useState<CostPeriod>('year')
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const currentMileage = activeCar
    ? getCurrentMileage(activeCar, serviceRecords, fuelRecords)
    : 0

  const allCarRecords = activeCar
    ? serviceRecords
        .filter(r => r.carId === activeCar.id && !r.deletedAt)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : []

  const group = SERVICE_GROUPS[filter]
  const filteredRecords = group
    ? allCarRecords.filter(r => group.includes(r.type))
    : allCarRecords

  const costRecords = filterRecordsByPeriod(allCarRecords, period)
  const costs = calculateServiceCosts(costRecords)

  function formatCost(amount: number): string {
    if (amount === 0) return '–'
    return `${amount.toLocaleString('cs-CZ')} Kč`
  }

  function handleCardPress(record: ServiceRecord) {
    setSelectedRecord(record)
    setDetailOpen(true)
  }

  function handleEdit(record: ServiceRecord) {
    setDetailOpen(false)
    setTimeout(() => openServiceForm(record), 320)
  }

  function handleDetailClose() {
    setDetailOpen(false)
  }

  return (
    <div style={{ padding: '56px 20px 20px', WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f0f0' }}>Servis</h1>
        {allCarRecords.length > 0 && (
          <span style={{ fontSize: 13, color: '#5c6070' }}>{allCarRecords.length} záznamů</span>
        )}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 12 }}>
        <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      {/* Period */}
      <div style={{ marginBottom: 12 }}>
        <SegmentedControl options={periodOptions} value={period} onChange={v => setPeriod(v as CostPeriod)} />
      </div>

      {/* Cost breakdown */}
      {activeCar && (
        <div style={{
          background: 'var(--bg3)',
          borderRadius: 14,
          border: '0.5px solid var(--border)',
          padding: '14px 16px',
          marginBottom: 16,
        }}>
          {[
            { label: 'Servis', value: costs.service },
            { label: 'Pojištění & STK', value: costs.insurance },
            { label: 'Ostatní', value: costs.other },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: 'var(--text2)' }}>{row.label}</span>
              <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{formatCost(row.value)}</span>
            </div>
          ))}
          <div style={{ borderTop: '0.5px solid var(--border)', margin: '8px 0', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, color: 'var(--text)', fontWeight: 600 }}>Celkem</span>
            <span style={{ fontSize: 15, color: 'var(--accent)', fontWeight: 600 }}>{formatCost(costs.total)}</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!activeCar ? (
        <div style={{ textAlign: 'center', color: '#5c6070', padding: '40px 0' }}>
          Nejdřív přidej auto
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#5c6070" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f0', marginBottom: 6 }}>
              {filter === 'all' ? 'Žádné servisní záznamy' : 'Žádné záznamy v této kategorii'}
            </div>
            <div style={{ fontSize: 13, color: '#9a9da8' }}>
              {filter === 'all' ? 'Přidej první záznam tlačítkem +' : 'Zkus změnit filtr'}
            </div>
          </div>
          {filter === 'all' && (
            <button
              type="button"
              onClick={() => openServiceForm()}
              style={{
                background: '#e8e8e8',
                color: '#0a0a0a', borderRadius: 14, padding: '12px 28px',
                fontSize: 15, fontWeight: 600, touchAction: 'manipulation',
              }}
            >
              Přidat záznam
            </button>
          )}
        </div>
      ) : (
        filteredRecords.map(r => (
          <ServiceCard
            key={r.id}
            record={r}
            currentMileage={currentMileage}
            onPress={() => handleCardPress(r)}
          />
        ))
      )}

      <ServiceDetail
        record={selectedRecord}
        isOpen={detailOpen}
        onClose={handleDetailClose}
        onEdit={handleEdit}
        currentMileage={currentMileage}
      />

    </div>
  )
}
