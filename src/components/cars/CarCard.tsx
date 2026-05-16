import type { Car } from '../../types'
import { useServiceStore } from '../../stores/useServiceStore'
import { useFuelStore } from '../../stores/useFuelStore'
import { getCurrentMileage, getLastMileageRecord } from '../../utils/calculations'
import { formatMileage } from '../../utils/formatters'
import { fuelTypeLabel } from '../../utils/labels'
import Badge from '../ui/Badge'

interface Props {
  car: Car
  onPress?: () => void
}

export default function CarCard({ car, onPress }: Props) {
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)
  const mileage = getCurrentMileage(car, serviceRecords, fuelRecords)
  const lastRecord = getLastMileageRecord(serviceRecords, fuelRecords, car.id)

  function formatLastUpdate(date: string): string {
    const d = new Date(date)
    const opts: Intl.DateTimeFormatOptions = d.getFullYear() === new Date().getFullYear()
      ? { day: 'numeric', month: 'numeric' }
      : { day: 'numeric', month: 'numeric', year: 'numeric' }
    return `aktualizováno ${d.toLocaleDateString('cs-CZ', opts)}`
  }

  return (
    <button
      type="button"
      onClick={() => { navigator.vibrate?.(10); onPress?.() }}
      className="pressable"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: '100%',
        background: '#141414',
        borderRadius: 16,
        border: '0.5px solid rgba(255,255,255,0.07)',
        padding: 16,
        marginBottom: 8,
        touchAction: 'manipulation',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f0' }}>
            {car.brand} {car.model}
          </div>
          <div style={{ fontSize: 13, color: '#9a9da8', marginTop: 2 }}>
            {car.year} · {car.licensePlate}
          </div>
        </div>
        <Badge label={fuelTypeLabel[car.fuelType] ?? car.fuelType} color="purple" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5c6070" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          <path d="M12 6v6l4 2" />
        </svg>
        <div>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#f0f0f0' }}>
            {formatMileage(mileage)}
          </span>
          {lastRecord && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              {formatLastUpdate(lastRecord.date)}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
