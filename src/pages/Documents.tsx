import { useState } from 'react'
import type { Document } from '../types'
import { useCarStore } from '../stores/useCarStore'
import { useDocumentStore } from '../stores/useDocumentStore'
import { daysUntil } from '../utils/formatters'
import { useFab } from '../context/FabContext'
import SegmentedControl from '../components/ui/SegmentedControl'
import DocumentCard from '../components/documents/DocumentCard'
import DocumentDetail from '../components/documents/DocumentDetail'

const filterOptions = [
  { label: 'Vše', value: 'all' },
  { label: 'Expirující', value: 'expiring' },
  { label: 'Bez expirace', value: 'no-expiry' },
]

export default function Documents() {
  const activeCar = useCarStore(s => s.activeCar)
  const documents = useDocumentStore(s => s.documents)
  const { openDocumentForm } = useFab()

  const [filter, setFilter] = useState('all')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const carDocs = activeCar
    ? documents.filter(d => d.carId === activeCar.id && !d.deletedAt)
    : []

  const filteredDocs = carDocs
    .filter(d => {
      if (filter === 'expiring') return !!d.expiryDate && daysUntil(d.expiryDate) <= 60
      if (filter === 'no-expiry') return !d.expiryDate
      return true
    })
    .sort((a, b) => {
      if (a.expiryDate && b.expiryDate) {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      }
      if (a.expiryDate && !b.expiryDate) return -1
      if (!a.expiryDate && b.expiryDate) return 1
      return 0
    })

  function handleCardPress(doc: Document) {
    setSelectedDoc(doc)
    setDetailOpen(true)
  }

  function handleEdit(doc: Document) {
    setDetailOpen(false)
    setTimeout(() => openDocumentForm(doc), 320)
  }

  return (
    <div style={{ padding: '56px 20px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0' }}>Dokumenty</h1>
        {carDocs.length > 0 && (
          <span style={{ fontSize: 13, color: '#5c6070' }}>{carDocs.length} dokumentů</span>
        )}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      {/* Content */}
      {!activeCar ? (
        <div style={{ textAlign: 'center', color: '#5c6070', padding: '40px 0' }}>Nejdřív přidej auto</div>
      ) : filteredDocs.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1e1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#5c6070" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 8h8M8 12h8M8 16h8"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f0', marginBottom: 6 }}>
              {filter === 'all' ? 'Žádné dokumenty' : 'Žádné dokumenty v této kategorii'}
            </div>
            <div style={{ fontSize: 13, color: '#9a9da8' }}>
              {filter === 'all' ? 'Přidej první dokument tlačítkem +' : 'Zkus změnit filtr'}
            </div>
          </div>
          {filter === 'all' && (
            <button
              type="button"
              onClick={() => openDocumentForm()}
              style={{
                background: '#e8e8e8',
                color: 'white', borderRadius: 14, padding: '12px 28px',
                fontSize: 15, fontWeight: 600, touchAction: 'manipulation',
              }}
            >
              Přidat dokument
            </button>
          )}
        </div>
      ) : (
        filteredDocs.map(d => (
          <DocumentCard key={d.id} doc={d} onPress={() => handleCardPress(d)} />
        ))
      )}

      <DocumentDetail
        doc={selectedDoc}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEdit}
      />
    </div>
  )
}
