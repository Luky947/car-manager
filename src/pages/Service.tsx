import { useState } from 'react'
import type { ServiceRecord } from '../types'
import { useCarStore } from '../stores/useCarStore'
import { useServiceStore } from '../stores/useServiceStore'
import { useFuelStore } from '../stores/useFuelStore'
import { getCurrentMileage } from '../utils/calculations'
import { SERVICE_GROUPS } from '../utils/serviceTypes'
import { useFab } from '../context/FabContext'
import SegmentedControl from '../components/ui/SegmentedControl'
import ServiceCard from '../components/service/ServiceCard'
import ServiceDetail from '../components/service/ServiceDetail'
import ServiceForm from '../components/service/ServiceForm'

const filterOptions = [
  { label: 'Vše', value: 'all' },
  { label: 'Servis', value: 'service' },
  { label: 'Pojištění & STK', value: 'docs' },
  { label: 'Ostatní', value: 'other' },
]

export default function Service() {
  const activeCar = useCarStore(s => s.activeCar)
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)
  const { serviceFormOpen, editingService, closeServiceForm, openServiceForm } = useFab()

  const [filter, setFilter] = useState('all')
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
    <div style={{ padding: '56px 20px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0' }}>Servis</h1>
        {allCarRecords.length > 0 && (
          <span style={{ fontSize: 13, color: '#5c6070' }}>{allCarRecords.length} záznamů</span>
        )}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      {/* Content */}
      {!activeCar ? (
        <div style={{ textAlign: 'center', color: '#5c6070', padding: '40px 0' }}>
          Nejdřív přidej auto
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1e1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                background: 'linear-gradient(135deg, #6c63ff, #4f9eff)',
                color: 'white', borderRadius: 14, padding: '12px 28px',
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

      <ServiceForm
        record={editingService ?? undefined}
        isOpen={serviceFormOpen}
        onClose={closeServiceForm}
      />
    </div>
  )
}
