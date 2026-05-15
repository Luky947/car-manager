import { useState } from 'react'
import type { FuelRecord } from '../../types'
import { useFuelStore } from '../../stores/useFuelStore'
import { formatDate, formatMileage } from '../../utils/formatters'
import BottomSheet from '../ui/BottomSheet'

interface Props {
  record: FuelRecord | null
  allRecords: FuelRecord[]
  isOpen: boolean
  onClose: () => void
  onEdit: (record: FuelRecord) => void
}

function calcSegmentConsumption(record: FuelRecord, allRecords: FuelRecord[]): number | null {
  const sorted = allRecords
    .filter(r => !r.deletedAt)
    .sort((a, b) => a.mileage - b.mileage)

  const idx = sorted.findIndex(r => r.id === record.id)
  if (idx === -1) return null

  let prevFullIdx = -1
  for (let i = idx - 1; i >= 0; i--) {
    if (sorted[i].fullTank) { prevFullIdx = i; break }
  }
  if (prevFullIdx === -1) return null

  const km = record.mileage - sorted[prevFullIdx].mileage
  if (km <= 0) return null

  let liters = 0
  for (let i = prevFullIdx + 1; i <= idx; i++) {
    liters += sorted[i].liters
  }

  return (liters / km) * 100
}

const row = (label: string, value: React.ReactNode, last = false) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: last ? 'none' : '0.5px solid rgba(0,0,0,0.06)' }}>
    <span style={{ fontSize: 13, color: '#5c6070' }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 500, color: '#0f0e17' }}>{value}</span>
  </div>
)

export default function FuelDetail({ record, allRecords, isOpen, onClose, onEdit }: Props) {
  const softDeleteRecord = useFuelStore(s => s.softDeleteRecord)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleDelete() {
    if (!record) return
    softDeleteRecord(record.id)
    setConfirmDelete(false)
    onClose()
  }

  function handleClose() {
    setConfirmDelete(false)
    onClose()
  }

  if (!record) return null

  const consumption = calcSegmentConsumption(record, allRecords)

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Detail tankování">
      <div style={{ padding: '0 20px 40px' }}>

        <div style={{ background: '#f8f7ff', borderRadius: 14, padding: '4px 16px', marginBottom: 20 }}>
          {row('Datum', formatDate(record.date))}
          {row('Km při tankování', formatMileage(record.mileage))}
          {row('Natankováno', `${record.liters.toFixed(2)} l`)}
          {row('Cena za litr', `${record.pricePerLiter.toFixed(2)} Kč/l`)}
          {row('Celková cena', `${record.totalCost.toLocaleString('cs-CZ')} Kč`)}
          {row('Plná nádrž',
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: record.fullTank ? '#22c55e' : '#9a9da8',
              background: record.fullTank ? 'rgba(34,197,94,0.12)' : 'rgba(0,0,0,0.06)',
              borderRadius: 6, padding: '2px 8px',
            }}>{record.fullTank ? 'Ano' : 'Ne'}</span>
          )}
          {consumption !== null && row('Spotřeba (úsek)', `${consumption.toFixed(1)} l/100km`)}
          {record.notes && row('Poznámky', <span style={{ maxWidth: '60%', textAlign: 'right', display: 'block' }}>{record.notes}</span>, true)}
        </div>

        {!confirmDelete ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => onEdit(record)}
              style={{ flex: 1, padding: 14, borderRadius: 14, background: '#f0f0f0', color: '#0f0e17', fontSize: 15, fontWeight: 600, touchAction: 'manipulation' }}
            >
              Upravit
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              style={{ flex: 1, padding: 14, borderRadius: 14, background: 'transparent', border: '1.5px solid #ef4444', color: '#ef4444', fontSize: 15, fontWeight: 600, touchAction: 'manipulation' }}
            >
              Smazat
            </button>
          </div>
        ) : (
          <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f0e17', marginBottom: 4 }}>Smazat záznam?</div>
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
