import { useState, useEffect } from 'react'
import type { FuelRecord } from '../../types'
import { useCarStore } from '../../stores/useCarStore'
import { useServiceStore } from '../../stores/useServiceStore'
import { useFuelStore } from '../../stores/useFuelStore'
import { getCurrentMileage } from '../../utils/calculations'
import { formatMileage } from '../../utils/formatters'
import BottomSheet from '../ui/BottomSheet'

interface Props {
  record?: FuelRecord
  isOpen: boolean
  onClose: () => void
}

interface FormState {
  date: string
  mileage: string
  liters: string
  pricePerLiter: string
  totalCost: string
  fullTank: boolean
  notes: string
}

interface FormErrors {
  date?: string
  mileage?: string
  liters?: string
  cost?: string
}

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

const inputFocus = { ...inputStyle, borderColor: '#4f9eff', boxShadow: '0 0 0 3px rgba(79,158,255,0.15)' } as const
const inputError = { ...inputStyle, borderColor: '#ef4444' } as const

function makeDefault(record: FuelRecord | undefined, currentMileage: number): FormState {
  if (record) {
    return {
      date: record.date,
      mileage: record.mileage.toString(),
      liters: record.liters.toString(),
      pricePerLiter: record.pricePerLiter.toString(),
      totalCost: record.totalCost.toString(),
      fullTank: record.fullTank,
      notes: record.notes ?? '',
    }
  }
  return {
    date: new Date().toISOString().slice(0, 10),
    mileage: currentMileage > 0 ? currentMileage.toString() : '',
    liters: '',
    pricePerLiter: '',
    totalCost: '',
    fullTank: true,
    notes: '',
  }
}

export default function FuelForm({ record, isOpen, onClose }: Props) {
  const activeCar = useCarStore(s => s.activeCar)
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)
  const addRecord = useFuelStore(s => s.addRecord)
  const updateRecord = useFuelStore(s => s.updateRecord)

  const currentMileage = activeCar
    ? getCurrentMileage(activeCar, serviceRecords, fuelRecords)
    : 0

  const [form, setForm] = useState<FormState>(() => makeDefault(record, currentMileage))
  const [errors, setErrors] = useState<FormErrors>({})
  const [focused, setFocused] = useState<string | null>(null)
  const [totalCostManual, setTotalCostManual] = useState(false)

  useEffect(() => {
    setForm(makeDefault(record, currentMileage))
    setErrors({})
    setTotalCostManual(false)
  }, [record?.id, isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleLitersChange(val: string) {
    setForm(f => {
      const liters = parseFloat(val)
      const ppl = parseFloat(f.pricePerLiter)
      if (!totalCostManual && !isNaN(liters) && !isNaN(ppl)) {
        return { ...f, liters: val, totalCost: (liters * ppl).toFixed(2) }
      }
      return { ...f, liters: val }
    })
    setErrors(e => ({ ...e, liters: undefined, cost: undefined }))
  }

  function handlePricePerLiterChange(val: string) {
    setForm(f => {
      const liters = parseFloat(f.liters)
      const ppl = parseFloat(val)
      if (!totalCostManual && !isNaN(liters) && !isNaN(ppl)) {
        return { ...f, pricePerLiter: val, totalCost: (liters * ppl).toFixed(2) }
      }
      return { ...f, pricePerLiter: val }
    })
    setErrors(e => ({ ...e, cost: undefined }))
  }

  function handleTotalCostChange(val: string) {
    setTotalCostManual(true)
    set('totalCost', val)
    setErrors(e => ({ ...e, cost: undefined }))
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!form.date) errs.date = 'Zadejte datum'
    const km = parseInt(form.mileage)
    if (!form.mileage || isNaN(km) || km < 0) errs.mileage = 'Zadejte platný počet km'
    const liters = parseFloat(form.liters)
    if (!form.liters || isNaN(liters) || liters <= 0) errs.liters = 'Zadejte platné množství'
    const ppl = parseFloat(form.pricePerLiter)
    const tc = parseFloat(form.totalCost)
    if ((!form.pricePerLiter || isNaN(ppl)) && (!form.totalCost || isNaN(tc))) {
      errs.cost = 'Zadejte cenu za litr nebo celkovou cenu'
    }
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (!activeCar) return

    const liters = parseFloat(form.liters)
    const ppl = parseFloat(form.pricePerLiter) || 0
    const tc = parseFloat(form.totalCost) || (liters * ppl)

    const data = {
      carId: activeCar.id,
      date: form.date,
      mileage: parseInt(form.mileage),
      liters,
      pricePerLiter: ppl,
      totalCost: tc,
      fullTank: form.fullTank,
      notes: form.notes.trim() || null,
    }

    if (record) {
      updateRecord(record.id, data)
    } else {
      addRecord(data)
    }
    onClose()
  }

  const mileageWarning = form.mileage && parseInt(form.mileage) < currentMileage
    ? `Nižší než aktuální stav (${formatMileage(currentMileage)})`
    : null

  const autoCalcActive = !totalCostManual && !!form.liters && !!form.pricePerLiter

  function suffix(text: string) {
    return (
      <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#9a9da8', fontSize: 14, pointerEvents: 'none' as const }}>
        {text}
      </span>
    )
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={record ? 'Upravit tankování' : 'Přidat tankování'}
    >
      <div style={{ padding: '0 20px 40px' }}>

        {/* Date */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>Datum</label>
          <input
            type="date"
            value={form.date}
            onChange={e => { set('date', e.target.value); setErrors(er => ({ ...er, date: undefined })) }}
            onFocus={() => setFocused('date')}
            onBlur={() => setFocused(null)}
            style={errors.date ? inputError : focused === 'date' ? inputFocus : inputStyle}
          />
          {errors.date && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.date}</p>}
        </div>

        {/* Mileage */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>Km při tankování</label>
          <div style={{ position: 'relative' }}>
            <input
              type="number" inputMode="numeric"
              value={form.mileage}
              onChange={e => { set('mileage', e.target.value); setErrors(er => ({ ...er, mileage: undefined })) }}
              onFocus={() => setFocused('mileage')}
              onBlur={() => setFocused(null)}
              style={{ ...(errors.mileage ? inputError : focused === 'mileage' ? inputFocus : inputStyle), paddingRight: 48 }}
            />
            {suffix('km')}
          </div>
          {errors.mileage && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.mileage}</p>}
          {!errors.mileage && mileageWarning && <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>{mileageWarning}</p>}
        </div>

        {/* Liters */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>Litry</label>
          <div style={{ position: 'relative' }}>
            <input
              type="number" inputMode="decimal"
              value={form.liters}
              onChange={e => handleLitersChange(e.target.value)}
              onFocus={() => setFocused('liters')}
              onBlur={() => setFocused(null)}
              placeholder="0.00"
              style={{ ...(errors.liters ? inputError : focused === 'liters' ? inputFocus : inputStyle), paddingRight: 36 }}
            />
            {suffix('l')}
          </div>
          {errors.liters && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.liters}</p>}
        </div>

        {/* Price per liter */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>Cena za litr</label>
          <div style={{ position: 'relative' }}>
            <input
              type="number" inputMode="decimal"
              value={form.pricePerLiter}
              onChange={e => handlePricePerLiterChange(e.target.value)}
              onFocus={() => setFocused('ppl')}
              onBlur={() => setFocused(null)}
              placeholder="0.00"
              style={{ ...(focused === 'ppl' ? inputFocus : inputStyle), paddingRight: 52 }}
            />
            {suffix('Kč/l')}
          </div>
        </div>

        {/* Total cost */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>
            Celková cena
            {autoCalcActive && (
              <span style={{ fontSize: 11, color: '#4f9eff', marginLeft: 6, fontWeight: 400 }}>auto</span>
            )}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number" inputMode="decimal"
              value={form.totalCost}
              onChange={e => handleTotalCostChange(e.target.value)}
              onFocus={() => setFocused('tc')}
              onBlur={() => setFocused(null)}
              placeholder="0"
              style={{ ...(errors.cost ? inputError : focused === 'tc' ? inputFocus : inputStyle), paddingRight: 48 }}
            />
            {suffix('Kč')}
          </div>
          {errors.cost && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.cost}</p>}
        </div>

        {/* Full tank toggle */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a' }}>Plná nádrž</div>
              <div style={{ fontSize: 12, color: '#5c6070', marginTop: 2 }}>Pro výpočet spotřeby</div>
            </div>
            <button
              type="button"
              onClick={() => set('fullTank', !form.fullTank)}
              style={{
                width: 48, height: 28, borderRadius: 14,
                background: form.fullTank ? '#4f9eff' : '#d1d5db',
                position: 'relative', border: 'none',
                transition: 'background 200ms', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 4,
                left: form.fullTank ? 24 : 4,
                width: 20, height: 20, borderRadius: '50%',
                background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'left 200ms',
              }} />
            </button>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>Poznámky (volitelné)</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            onFocus={() => setFocused('notes')}
            onBlur={() => setFocused(null)}
            rows={2}
            style={{ ...(focused === 'notes' ? inputFocus : inputStyle), resize: 'none' as const, lineHeight: '1.5' }}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #4f9eff, #6c63ff)',
            color: 'white', borderRadius: 14, padding: 16,
            fontSize: 16, fontWeight: 600, touchAction: 'manipulation',
          }}
        >
          {record ? 'Uložit změny' : 'Přidat tankování'}
        </button>
      </div>
    </BottomSheet>
  )
}
