import { useState, useEffect } from 'react'
import type { Document } from '../../types'
import { useCarStore } from '../../stores/useCarStore'
import { useDocumentStore } from '../../stores/useDocumentStore'
import BottomSheet from '../ui/BottomSheet'
import SegmentedControl from '../ui/SegmentedControl'

interface Props {
  doc?: Document
  isOpen: boolean
  onClose: () => void
}

interface FormState {
  title: string
  type: Document['type']
  expiryDate: string
  notes: string
}

const typeOptions = [
  { label: 'Pojištění', value: 'insurance' },
  { label: 'Registrace', value: 'registration' },
  { label: 'Záruka', value: 'warranty' },
  { label: 'Faktura', value: 'invoice' },
  { label: 'Jiné', value: 'other' },
]

const inputStyle = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 12,
  padding: '14px 16px',
  fontSize: 16,
  color: '#0a0a0a',
  outline: 'none',
  fontFamily: 'inherit',
} as const

const inputFocus = { ...inputStyle, borderColor: '#6c63ff', boxShadow: '0 0 0 3px rgba(108,99,255,0.15)' } as const
const inputError = { ...inputStyle, borderColor: '#ef4444' } as const

function makeDefault(doc: Document | undefined): FormState {
  if (doc) {
    return { title: doc.title, type: doc.type, expiryDate: doc.expiryDate ?? '', notes: doc.notes ?? '' }
  }
  return { title: '', type: 'insurance', expiryDate: '', notes: '' }
}

export default function DocumentForm({ doc, isOpen, onClose }: Props) {
  const activeCar = useCarStore(s => s.activeCar)
  const addDocument = useDocumentStore(s => s.addDocument)
  const updateDocument = useDocumentStore(s => s.updateDocument)

  const [form, setForm] = useState<FormState>(() => makeDefault(doc))
  const [titleError, setTitleError] = useState<string | undefined>()
  const [focused, setFocused] = useState<string | null>(null)

  useEffect(() => {
    setForm(makeDefault(doc))
    setTitleError(undefined)
  }, [doc?.id, isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSubmit() {
    const title = form.title.trim()
    if (!title) { setTitleError('Zadejte název dokumentu'); return }
    if (!activeCar) return

    const data = {
      carId: activeCar.id,
      type: form.type,
      title,
      expiryDate: form.expiryDate || null,
      driveFileId: null,
      notes: form.notes.trim() || null,
    }

    if (doc) {
      updateDocument(doc.id, data)
    } else {
      addDocument(data)
    }
    onClose()
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={doc ? 'Upravit dokument' : 'Přidat dokument'}
    >
      <div style={{ padding: '0 20px 40px' }}>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>Název</label>
          <input
            type="text"
            value={form.title}
            onChange={e => { set('title', e.target.value); setTitleError(undefined) }}
            onFocus={() => setFocused('title')}
            onBlur={() => setFocused(null)}
            placeholder="Povinné ručení 2026..."
            style={titleError ? inputError : focused === 'title' ? inputFocus : inputStyle}
          />
          {titleError && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{titleError}</p>}
        </div>

        {/* Type */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>Typ</label>
          <SegmentedControl
            options={typeOptions}
            value={form.type}
            onChange={v => set('type', v as Document['type'])}
          />
        </div>

        {/* Expiry date */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>Datum expirace (volitelné)</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={e => set('expiryDate', e.target.value)}
            onFocus={() => setFocused('exp')}
            onBlur={() => setFocused(null)}
            style={focused === 'exp' ? inputFocus : inputStyle}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>Poznámky (volitelné)</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            onFocus={() => setFocused('notes')}
            onBlur={() => setFocused(null)}
            rows={3}
            style={{ ...(focused === 'notes' ? inputFocus : inputStyle), resize: 'none' as const, lineHeight: '1.5' }}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #6c63ff, #4f9eff)',
            color: 'white', borderRadius: 14, padding: 16,
            fontSize: 16, fontWeight: 600, touchAction: 'manipulation',
          }}
        >
          {doc ? 'Uložit změny' : 'Přidat dokument'}
        </button>
      </div>
    </BottomSheet>
  )
}
