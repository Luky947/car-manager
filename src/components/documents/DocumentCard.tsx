import type { Document } from '../../types'
import { daysUntil } from '../../utils/formatters'

interface Props {
  doc: Document
  onPress: () => void
}

const docTypeLabel: Record<Document['type'], string> = {
  insurance: 'Pojištění',
  registration: 'Registrace',
  warranty: 'Záruka',
  invoice: 'Faktura',
  other: 'Jiné',
}

function DocIcon({ type }: { type: Document['type'] }) {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: '#e8e8e8', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (type) {
    case 'insurance':
      return <svg {...p}><path d="M12 2 L4 6v6c0 5 4 9 8 10c4-1 8-5 8-10V6L12 2z"/></svg>
    case 'registration':
      return <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/><circle cx="16" cy="16" r="1" fill="#e8e8e8" stroke="none"/></svg>
    case 'warranty':
      return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    case 'invoice':
      return <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 8h8M8 12h5"/><path d="M14 16h2M12 16h-1"/></svg>
    case 'other':
      return <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 8h8M8 12h8M8 16h8"/></svg>
  }
}

function expiryInfo(days: number | null, expiryDate: string | null): { label: string; color: string } {
  if (!expiryDate) return { label: 'Bez expirace', color: '#22c55e' }
  if (days === null) return { label: '', color: '#9a9da8' }
  if (days < 0) return { label: 'Prošlé', color: '#ef4444' }
  if (days === 0) return { label: 'Dnes', color: '#ef4444' }
  if (days <= 30) return { label: `Za ${days} dní`, color: '#f59e0b' }
  if (days <= 60) return { label: `Za ${days} dní`, color: '#fbbf24' }
  return { label: `Za ${days} dní`, color: '#22c55e' }
}

export default function DocumentCard({ doc, onPress }: Props) {
  const days = doc.expiryDate ? daysUntil(doc.expiryDate) : null
  const { label, color } = expiryInfo(days, doc.expiryDate)

  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        background: '#161616',
        borderRadius: 14,
        border: '0.5px solid rgba(255,255,255,0.06)',
        padding: '14px 16px',
        marginBottom: 8,
        touchAction: 'manipulation',
        textAlign: 'left',
        transition: 'transform 100ms',
      }}
      onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
      onPointerUp={e => (e.currentTarget.style.transform = '')}
      onPointerLeave={e => (e.currentTarget.style.transform = '')}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <DocIcon type={doc.type} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {doc.title}
        </div>
        <span style={{ fontSize: 12, color: '#9a9da8' }}>{docTypeLabel[doc.type]}</span>
      </div>

      {/* Right */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color }}>{label}</div>
        {doc.expiryDate && (
          <div style={{ fontSize: 11, color: '#5c6070', marginTop: 2 }}>
            {new Date(doc.expiryDate).toLocaleDateString('cs-CZ')}
          </div>
        )}
      </div>
    </button>
  )
}
