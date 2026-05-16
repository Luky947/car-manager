import { useState, useEffect } from 'react'
import type { ServiceRecord, ServiceType } from '../../types'
import { useCarStore } from '../../stores/useCarStore'
import { useServiceStore } from '../../stores/useServiceStore'
import { useFuelStore } from '../../stores/useFuelStore'
import { getCurrentMileage } from '../../utils/calculations'
import { formatMileage } from '../../utils/formatters'
import { SERVICE_TYPE_LABELS, ALL_SERVICE_TYPES } from '../../utils/serviceTypes'
import BottomSheet from '../ui/BottomSheet'
import ServiceIcon from './ServiceIcon'

interface Props {
  record?: ServiceRecord
  isOpen: boolean
  onClose: () => void
}

interface FormState {
  type: ServiceType | ''
  date: string
  mileage: string
  cost: string
  garage: string
  notes: string
  reminderEnabled: boolean
  nextServiceDate: string
  nextServiceMileage: string
}

interface FormErrors {
  type?: string
  date?: string
  mileage?: string
  nextService?: string
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

const inputFocus = {
  ...inputStyle,
  borderColor: '#6c63ff',
  boxShadow: '0 0 0 3px rgba(108,99,255,0.15)',
} as const

const inputError = {
  ...inputStyle,
  borderColor: '#ef4444',
} as const

function makeDefault(record: ServiceRecord | undefined, currentMileage: number): FormState {
  if (record) {
    return {
      type: record.type,
      date: record.date,
      mileage: record.mileage.toString(),
      cost: record.cost?.toString() ?? '',
      garage: record.garage ?? '',
      notes: record.notes,
      reminderEnabled: record.reminderEnabled,
      nextServiceDate: record.nextServiceDate ?? '',
      nextServiceMileage: record.nextServiceMileage?.toString() ?? '',
    }
  }
  return {
    type: '',
    date: new Date().toISOString().slice(0, 10),
    mileage: currentMileage > 0 ? currentMileage.toString() : '',
    cost: '',
    garage: '',
    notes: '',
    reminderEnabled: false,
    nextServiceDate: '',
    nextServiceMileage: '',
  }
}

export default function ServiceForm({ record, isOpen, onClose }: Props) {
  const activeCar = useCarStore(s => s.activeCar)
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)
  const addRecord = useServiceStore(s => s.addRecord)
  const updateRecord = useServiceStore(s => s.updateRecord)

  const currentMileage = activeCar
    ? getCurrentMileage(activeCar, serviceRecords, fuelRecords)
    : 0

  const [form, setForm] = useState<FormState>(() => makeDefault(record, currentMileage))
  const [errors, setErrors] = useState<FormErrors>({})
  const [focused, setFocused] = useState<string | null>(null)

  useEffect(() => {
    setForm(makeDefault(record, currentMileage))
    setErrors({})
  }, [record?.id, isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function clearError(key: keyof FormErrors) {
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!form.type) errs.type = 'Vyberte typ servisu'
    if (!form.date) errs.date = 'Zadejte datum'
    const km = parseInt(form.mileage)
    if (!form.mileage || isNaN(km) || km < 0) errs.mileage = 'Zadejte platný počet km'
    if (form.reminderEnabled && !form.nextServiceDate && !form.nextServiceMileage) {
      errs.nextService = 'Zadejte datum nebo km příštího servisu'
    }
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (!activeCar) return

    const km = parseInt(form.mileage)
    const data = {
      carId: activeCar.id,
      type: form.type as ServiceType,
      date: form.date,
      mileage: km,
      cost: form.cost ? parseFloat(form.cost) : null,
      garage: form.garage.trim() || null,
      notes: form.notes.trim(),
      reminderEnabled: form.reminderEnabled,
      nextServiceDate: form.reminderEnabled && form.nextServiceDate ? form.nextServiceDate : null,
      nextServiceMileage: form.reminderEnabled && form.nextServiceMileage
        ? parseInt(form.nextServiceMileage) : null,
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

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={record ? 'Upravit záznam' : 'Nový servisní záznam'}
    >
      <div style={{ padding: '0 20px 40px' }}>

        {/* Type grid */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', marginBottom: 10 }}>
            Typ servisu
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {ALL_SERVICE_TYPES.map(t => {
              const active = form.type === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => { set('type', t); clearError('type') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    background: active ? 'rgba(108,99,255,0.1)' : '#ffffff',
                    border: active ? '1.5px solid #6c63ff' : '1px solid rgba(0,0,0,0.10)',
                    borderRadius: 12,
                    touchAction: 'manipulation',
                    textAlign: 'left' as const,
                    transition: 'all 120ms',
                  }}
                >
                  <ServiceIcon type={t} size={18} color={active ? '#6c63ff' : '#9a9da8'} />
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? '#0a0a0a' : '#5c6070', lineHeight: 1.3 }}>
                    {SERVICE_TYPE_LABELS[t]}
                  </span>
                </button>
              )
            })}
          </div>
          {errors.type && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>{errors.type}</p>}
        </div>

        {/* Date */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>
            Datum
          </label>
          <input
            type="date"
            value={form.date}
            onChange={e => { set('date', e.target.value); clearError('date') }}
            onFocus={() => setFocused('date')}
            onBlur={() => setFocused(null)}
            style={errors.date ? inputError : focused === 'date' ? inputFocus : inputStyle}
          />
          {errors.date && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.date}</p>}
        </div>

        {/* Mileage */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>
            Km při servisu
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              inputMode="numeric"
              value={form.mileage}
              onChange={e => { set('mileage', e.target.value); clearError('mileage') }}
              onFocus={() => setFocused('mileage')}
              onBlur={() => setFocused(null)}
              style={{
                ...(errors.mileage ? inputError : focused === 'mileage' ? inputFocus : inputStyle),
                paddingRight: 48,
              }}
            />
            <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#9a9da8', fontSize: 14, pointerEvents: 'none' as const }}>km</span>
          </div>
          {errors.mileage && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.mileage}</p>}
          {!errors.mileage && mileageWarning && (
            <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>{mileageWarning}</p>
          )}
        </div>

        {/* Cost */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>
            Cena (volitelné)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              inputMode="decimal"
              value={form.cost}
              onChange={e => set('cost', e.target.value)}
              onFocus={() => setFocused('cost')}
              onBlur={() => setFocused(null)}
              placeholder="0"
              style={{ ...(focused === 'cost' ? inputFocus : inputStyle), paddingRight: 52 }}
            />
            <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#9a9da8', fontSize: 14, pointerEvents: 'none' as const }}>Kč</span>
          </div>
        </div>

        {/* Garage */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>
            Místo / garáž (volitelné)
          </label>
          <input
            type="text"
            value={form.garage}
            onChange={e => set('garage', e.target.value)}
            onFocus={() => setFocused('garage')}
            onBlur={() => setFocused(null)}
            placeholder="Autoservis Novák..."
            style={focused === 'garage' ? inputFocus : inputStyle}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5c6070', display: 'block', marginBottom: 6 }}>
            Poznámky (volitelné)
          </label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            onFocus={() => setFocused('notes')}
            onBlur={() => setFocused(null)}
            rows={3}
            style={{
              ...(focused === 'notes' ? inputFocus : inputStyle),
              resize: 'none' as const,
              lineHeight: '1.5',
            }}
          />
        </div>

        {/* Reminder toggle */}
        <div style={{ marginBottom: form.reminderEnabled ? 16 : 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a' }}>Připomínka</div>
              <div style={{ fontSize: 12, color: '#5c6070', marginTop: 2 }}>Upozornit na příští servis</div>
            </div>
            <button
              type="button"
              onClick={() => set('reminderEnabled', !form.reminderEnabled)}
              style={{
                width: 48, height: 28, borderRadius: 14,
                background: form.reminderEnabled ? '#6c63ff' : '#d1d5db',
                position: 'relative', border: 'none',
                transition: 'background 200ms', cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 4,
                left: form.reminderEnabled ? 24 : 4,
                width: 20, height: 20, borderRadius: '50%',
                background: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'left 200ms',
              }} />
            </button>
          </div>
        </div>

        {form.reminderEnabled && (
          <div style={{ background: 'rgba(108,99,255,0.04)', borderRadius: 14, border: '0.5px solid rgba(108,99,255,0.15)', padding: '14px 16px', marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: '#6c63ff', fontWeight: 600, marginBottom: 14, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Příští servis
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#5c6070', display: 'block', marginBottom: 6 }}>Datum</label>
              <input
                type="date"
                value={form.nextServiceDate}
                onChange={e => { set('nextServiceDate', e.target.value); clearError('nextService') }}
                onFocus={() => setFocused('nsd')}
                onBlur={() => setFocused(null)}
                style={focused === 'nsd' ? inputFocus : inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#5c6070', display: 'block', marginBottom: 6 }}>Km</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.nextServiceMileage}
                  onChange={e => { set('nextServiceMileage', e.target.value); clearError('nextService') }}
                  onFocus={() => setFocused('nsm')}
                  onBlur={() => setFocused(null)}
                  placeholder="napr. 95000"
                  style={{ ...(focused === 'nsm' ? inputFocus : inputStyle), paddingRight: 48 }}
                />
                <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#9a9da8', fontSize: 14, pointerEvents: 'none' as const }}>km</span>
              </div>
            </div>
            {errors.nextService && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{errors.nextService}</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #6c63ff, #4f9eff)',
            color: 'white', borderRadius: 14, padding: 16,
            fontSize: 16, fontWeight: 600,
            touchAction: 'manipulation',
          }}
        >
          {record ? 'Uložit změny' : 'Přidat záznam'}
        </button>
      </div>
    </BottomSheet>
  )
}
