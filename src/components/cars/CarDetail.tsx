import type { Car } from '../../types'
import { useServiceStore } from '../../stores/useServiceStore'
import { useFuelStore } from '../../stores/useFuelStore'
import { getCurrentMileage, getLastMileageRecord } from '../../utils/calculations'
import { fuelTypeLabel } from '../../utils/labels'

interface Props {
  car: Car | null
  onEdit: () => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)',
    }}>
      <span style={{ fontSize: 14, color: '#5c6070' }}>{label}</span>
      <span style={{ fontSize: 14, color: '#0a0a0a', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
      color: '#9a9da8', marginTop: 24, marginBottom: 4,
    }}>
      {children}
    </div>
  )
}

export default function CarDetail({ car, onEdit }: Props) {
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)

  if (!car) return null

  const mileage = getCurrentMileage(car, serviceRecords, fuelRecords)
  const lastRecord = getLastMileageRecord(serviceRecords, fuelRecords, car.id)
  const serviceCount = serviceRecords.filter(r => r.carId === car.id && !r.deletedAt).length
  const fuelCount = fuelRecords.filter(r => r.carId === car.id && !r.deletedAt).length

  function formatDate(date: string): string {
    const d = new Date(date)
    const opts: Intl.DateTimeFormatOptions = d.getFullYear() === new Date().getFullYear()
      ? { day: 'numeric', month: 'numeric' }
      : { day: 'numeric', month: 'numeric', year: 'numeric' }
    return d.toLocaleDateString('cs-CZ', opts)
  }

  return (
    <div style={{ padding: '0 20px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#0a0a0a', marginBottom: 4 }}>
          {car.brand} {car.model}
        </div>
        <div style={{ fontSize: 14, color: '#5c6070' }}>
          {car.year} · {car.licensePlate} · {fuelTypeLabel[car.fuelType]}
        </div>
      </div>

      {/* Informace */}
      <SectionLabel>Informace</SectionLabel>
      <Row label="Značka" value={car.brand} />
      <Row label="Model" value={car.model} />
      <Row label="Rok výroby" value={car.year.toString()} />
      <Row label="SPZ" value={car.licensePlate} />
      <Row label="VIN" value={car.vin || '–'} />
      <Row label="Typ paliva" value={fuelTypeLabel[car.fuelType]} />
      <Row label="Barva" value={car.color || '–'} />
      <Row label="Poznámky" value={car.notes || '–'} />

      {/* Aktuální stav */}
      <SectionLabel>Aktuální stav</SectionLabel>
      <Row label="Aktuální km" value={`${mileage.toLocaleString('cs-CZ')} km`} />
      <Row label="Aktualizováno" value={lastRecord ? formatDate(lastRecord.date) : '–'} />
      <Row label="Servisní záznamy" value={serviceCount.toString()} />
      <Row label="Tankování" value={fuelCount.toString()} />

      {/* Button */}
      <button
        type="button"
        onClick={onEdit}
        style={{
          width: '100%', padding: 16, borderRadius: 14, marginTop: 24,
          fontSize: 16, fontWeight: 600, touchAction: 'manipulation',
          background: '#0a0a0a', color: '#f0f0f0', border: 'none',
        }}
      >
        Upravit auto
      </button>
    </div>
  )
}
