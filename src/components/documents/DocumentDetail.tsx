import { useState } from 'react'
import type { Document } from '../../types'
import { useDocumentStore } from '../../stores/useDocumentStore'
import { daysUntil } from '../../utils/formatters'
import BottomSheet from '../ui/BottomSheet'

interface Props {
  doc: Document | null
  isOpen: boolean
  onClose: () => void
  onEdit: (doc: Document) => void
}

const docTypeLabel: Record<Document['type'], string> = {
  insurance: 'Pojištění',
  registration: 'Registrace',
  warranty: 'Záruka',
  invoice: 'Faktura',
  other: 'Jiné',
}

export default function DocumentDetail({ doc, isOpen, onClose, onEdit }: Props) {
  const softDeleteDocument = useDocumentStore(s => s.softDeleteDocument)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleDelete() {
    if (!doc) return
    softDeleteDocument(doc.id)
    setConfirmDelete(false)
    onClose()
  }

  function handleClose() {
    setConfirmDelete(false)
    onClose()
  }

  if (!doc) return null

  const d = doc
  const days = d.expiryDate ? daysUntil(d.expiryDate) : null

  function expiryColor(): string {
    if (days === null) return '#22c55e'
    if (days < 0) return '#ef4444'
    if (days <= 30) return '#f59e0b'
    if (days <= 60) return '#fbbf24'
    return '#22c55e'
  }

  function expiryText(): string {
    if (!d.expiryDate) return 'Bez expirace'
    const date = new Date(d.expiryDate).toLocaleDateString('cs-CZ')
    if (days === null) return date
    if (days < 0) return `Prošlé — ${date}`
    if (days === 0) return `Dnes — ${date}`
    return `Za ${days} dní — ${date}`
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Detail dokumentu">
      <div style={{ padding: '0 20px 40px' }}>

        <div style={{ background: '#f8f7ff', borderRadius: 14, padding: '4px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: 13, color: '#5c6070' }}>Název</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f0e17', maxWidth: '65%', textAlign: 'right' }}>{doc.title}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: 13, color: '#5c6070' }}>Typ</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6c63ff', background: 'rgba(108,99,255,0.1)', borderRadius: 6, padding: '2px 8px' }}>
              {docTypeLabel[doc.type]}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: doc.notes ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
            <span style={{ fontSize: 13, color: '#5c6070' }}>Expirace</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: expiryColor() }}>{expiryText()}</span>
          </div>

          {doc.notes && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0' }}>
              <span style={{ fontSize: 13, color: '#5c6070' }}>Poznámky</span>
              <span style={{ fontSize: 14, color: '#0f0e17', maxWidth: '60%', textAlign: 'right' }}>{doc.notes}</span>
            </div>
          )}
        </div>

        {!confirmDelete ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={() => onEdit(doc)} style={{ flex: 1, padding: 14, borderRadius: 14, background: '#f0f0f0', color: '#0f0e17', fontSize: 15, fontWeight: 600, touchAction: 'manipulation' }}>
              Upravit
            </button>
            <button type="button" onClick={() => setConfirmDelete(true)} style={{ flex: 1, padding: 14, borderRadius: 14, background: 'transparent', border: '1.5px solid #ef4444', color: '#ef4444', fontSize: 15, fontWeight: 600, touchAction: 'manipulation' }}>
              Smazat
            </button>
          </div>
        ) : (
          <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f0e17', marginBottom: 4 }}>Smazat dokument?</div>
            <div style={{ fontSize: 13, color: '#5c6070', marginBottom: 16 }}>Tato akce je nevratná.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#f0f0f0', color: '#0f0e17', fontSize: 14, fontWeight: 600, touchAction: 'manipulation' }}>Zrušit</button>
              <button type="button" onClick={handleDelete} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#ef4444', color: 'white', fontSize: 14, fontWeight: 600, touchAction: 'manipulation' }}>Smazat</button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
