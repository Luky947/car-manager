import { useCarStore } from '../stores/useCarStore'
import { useFuelStore } from '../stores/useFuelStore'
import { formatDate, formatMileage } from '../utils/formatters'
import Badge from '../components/ui/Badge'

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#5c6070',
  marginBottom: 12,
  fontWeight: 500,
}

export default function Fuel() {
  const activeCar = useCarStore(s => s.activeCar)
  const fuelRecords = useFuelStore(s => s.records)

  const carRecords = activeCar
    ? fuelRecords
        .filter(r => r.carId === activeCar.id && !r.deletedAt)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : []

  return (
    <div style={{ padding: '56px 20px 20px' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0', marginBottom: 24 }}>
        Tankování
      </div>

      {!activeCar ? (
        <div style={{ textAlign: 'center', color: '#5c6070', padding: '40px 0' }}>
          Nejdřív přidej auto
        </div>
      ) : carRecords.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#5c6070', padding: '40px 0' }}>
          Žádné záznamy o tankování
        </div>
      ) : (
        <>
          <p style={sectionLabel}>{carRecords.length} tankování</p>
          {carRecords.map(r => (
            <div
              key={r.id}
              style={{
                background: '#1e1d2e',
                borderRadius: 14,
                border: '0.5px solid rgba(255,255,255,0.06)',
                padding: '14px 16px',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0' }}>
                    {r.liters.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} l
                  </div>
                  <div style={{ fontSize: 12, color: '#9a9da8', marginTop: 2 }}>
                    {r.pricePerLiter.toFixed(2)} Kč/l
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0' }}>
                    {r.totalCost.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč
                  </div>
                  {r.fullTank && <Badge label="Plná nádrž" color="purple" />}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5c6070" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span style={{ fontSize: 12, color: '#9a9da8' }}>{formatDate(r.date)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5c6070" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span style={{ fontSize: 12, color: '#9a9da8' }}>{formatMileage(r.mileage)}</span>
                </div>
              </div>
              {r.notes && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#5c6070', fontStyle: 'italic' }}>
                  {r.notes}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
