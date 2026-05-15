import { useCarStore } from '../stores/useCarStore'
import { useDocumentStore } from '../stores/useDocumentStore'
import { formatDate, daysUntil } from '../utils/formatters'
import Badge from '../components/ui/Badge'

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#5c6070',
  marginBottom: 12,
  fontWeight: 500,
}

const docTypeLabel: Record<string, string> = {
  insurance: 'Pojištění',
  registration: 'Registrace',
  warranty: 'Záruka',
  invoice: 'Faktura',
  other: 'Ostatní',
}

export default function Documents() {
  const activeCar = useCarStore(s => s.activeCar)
  const documents = useDocumentStore(s => s.documents)

  const carDocs = activeCar
    ? documents
        .filter(d => d.carId === activeCar.id && !d.deletedAt)
        .sort((a, b) => {
          if (!a.expiryDate) return 1
          if (!b.expiryDate) return -1
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        })
    : []

  function getExpiryBadge(expiryDate: string | null) {
    if (!expiryDate) return null
    const days = daysUntil(expiryDate)
    if (days < 0) return { label: 'Expirováno', color: 'red' as const }
    if (days <= 30) return { label: `Za ${days} dní`, color: 'amber' as const }
    return { label: formatDate(expiryDate), color: 'green' as const }
  }

  return (
    <div style={{ padding: '56px 20px 20px' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0', marginBottom: 24 }}>
        Dokumenty
      </div>

      {!activeCar ? (
        <div style={{ textAlign: 'center', color: '#5c6070', padding: '40px 0' }}>
          Nejdřív přidej auto
        </div>
      ) : carDocs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#5c6070', padding: '40px 0' }}>
          Žádné dokumenty
        </div>
      ) : (
        <>
          <p style={sectionLabel}>{carDocs.length} dokumentů</p>
          {carDocs.map(doc => {
            const expiry = getExpiryBadge(doc.expiryDate)
            return (
              <div
                key={doc.id}
                style={{
                  background: '#1e1d2e',
                  borderRadius: 14,
                  border: '0.5px solid rgba(255,255,255,0.06)',
                  padding: '14px 16px',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0', marginBottom: 4 }}>
                      {doc.title}
                    </div>
                    <Badge label={docTypeLabel[doc.type] ?? doc.type} color="default" />
                  </div>
                  {expiry && <Badge label={expiry.label} color={expiry.color} />}
                </div>
                {doc.notes && (
                  <div style={{ marginTop: 10, fontSize: 12, color: '#5c6070' }}>{doc.notes}</div>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
