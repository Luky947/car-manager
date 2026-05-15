import { useState } from 'react'
import type { Car } from '../../types'
import { useCarStore } from '../../stores/useCarStore'
import SegmentedControl from '../ui/SegmentedControl'

interface Props {
  car?: Car
  onClose: () => void
}

interface FormState {
  brand: string
  model: string
  year: string
  licensePlate: string
  vin: string
  fuelType: string
  currentMileage: string
  color: string
  notes: string
}

interface FormErrors {
  brand?: string
  model?: string
  year?: string
  licensePlate?: string
  currentMileage?: string
}

const fuelOptions = [
  { label: 'Benzín', value: 'petrol' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Elektro', value: 'electric' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'LPG', value: 'lpg' },
]

function validate(data: FormState): FormErrors {
  const maxYear = new Date().getFullYear() + 1
  const errors: FormErrors = {}
  if (!data.brand.trim()) errors.brand = 'Značka je povinná'
  if (!data.model.trim()) errors.model = 'Model je povinný'
  const y = parseInt(data.year)
  if (!data.year || isNaN(y) || y < 1990 || y > maxYear) {
    errors.year = `Rok musí být mezi 1990 a ${maxYear}`
  }
  if (!data.licensePlate.trim()) errors.licensePlate = 'SPZ je povinná'
  const km = parseInt(data.currentMileage)
  if (!data.currentMileage || isNaN(km) || km < 0) {
    errors.currentMileage = 'Zadej platný počet km'
  }
  return errors
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 12,
  padding: '14px 16px',
  fontSize: 16,
  color: '#0f0e17',
  outline: 'none',
}

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: '#6c63ff',
  boxShadow: '0 0 0 3px rgba(108,99,255,0.15)',
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: '#5c6070',
  display: 'block',
  marginBottom: 6,
}

const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#ef4444',
  marginTop: 4,
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  )
}

function TextInput({
  value, onChange, placeholder, type = 'text', inputMode, min, max,
  suffix, focused, onFocus, onBlur, error
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  min?: number
  max?: number
  suffix?: string
  focused: boolean
  onFocus: () => void
  onBlur: () => void
  error?: boolean
}) {
  const style = {
    ...(focused ? inputFocusStyle : inputStyle),
    ...(error ? { borderColor: '#ef4444' } : {}),
    ...(suffix ? { paddingRight: 48 } : {}),
  }
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        style={style}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {suffix && (
        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#9a9da8', fontSize: 14, pointerEvents: 'none' }}>
          {suffix}
        </span>
      )}
    </div>
  )
}

export default function CarForm({ car, onClose }: Props) {
  const { addCar, updateCar } = useCarStore()
  const [focused, setFocused] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [form, setForm] = useState<FormState>({
    brand: car?.brand ?? '',
    model: car?.model ?? '',
    year: car?.year.toString() ?? '',
    licensePlate: car?.licensePlate ?? '',
    vin: car?.vin ?? '',
    fuelType: car?.fuelType ?? 'petrol',
    currentMileage: car?.currentMileage.toString() ?? '',
    color: car?.color ?? '',
    notes: car?.notes ?? '',
  })

  function set(key: keyof FormState) {
    return (v: string) => setForm(f => ({ ...f, [key]: v }))
  }

  function handleSubmit() {
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const data = {
      name: `${form.brand} ${form.model}`,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: parseInt(form.year),
      licensePlate: form.licensePlate.trim().toUpperCase(),
      vin: form.vin.trim() || null,
      fuelType: form.fuelType as Car['fuelType'],
      currentMileage: parseInt(form.currentMileage),
      color: form.color.trim() || null,
      notes: form.notes.trim(),
    }
    if (car) {
      updateCar(car.id, data)
    } else {
      addCar(data)
    }
    onClose()
  }

  return (
    <div style={{ padding: '8px 20px 32px' }}>
      <Field label="Značka" error={errors.brand}>
        <TextInput
          value={form.brand}
          onChange={v => { set('brand')(v); setErrors(e => ({ ...e, brand: undefined })) }}
          placeholder="Škoda, VW, BMW…"
          focused={focused === 'brand'}
          onFocus={() => setFocused('brand')}
          onBlur={() => setFocused(null)}
          error={!!errors.brand}
        />
      </Field>

      <Field label="Model" error={errors.model}>
        <TextInput
          value={form.model}
          onChange={v => { set('model')(v); setErrors(e => ({ ...e, model: undefined })) }}
          placeholder="Octavia, Golf, 3 Series…"
          focused={focused === 'model'}
          onFocus={() => setFocused('model')}
          onBlur={() => setFocused(null)}
          error={!!errors.model}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Rok výroby" error={errors.year}>
          <TextInput
            value={form.year}
            onChange={v => { set('year')(v); setErrors(e => ({ ...e, year: undefined })) }}
            placeholder="2020"
            type="number"
            inputMode="numeric"
            min={1990}
            max={new Date().getFullYear() + 1}
            focused={focused === 'year'}
            onFocus={() => setFocused('year')}
            onBlur={() => setFocused(null)}
            error={!!errors.year}
          />
        </Field>

        <Field label="SPZ" error={errors.licensePlate}>
          <TextInput
            value={form.licensePlate}
            onChange={v => { set('licensePlate')(v.toUpperCase()); setErrors(e => ({ ...e, licensePlate: undefined })) }}
            placeholder="1AB2345"
            focused={focused === 'spz'}
            onFocus={() => setFocused('spz')}
            onBlur={() => setFocused(null)}
            error={!!errors.licensePlate}
          />
        </Field>
      </div>

      <Field label="Pohon">
        <SegmentedControl options={fuelOptions} value={form.fuelType} onChange={set('fuelType')} />
      </Field>

      <Field label="Aktuální stav (km)" error={errors.currentMileage}>
        <TextInput
          value={form.currentMileage}
          onChange={v => { set('currentMileage')(v); setErrors(e => ({ ...e, currentMileage: undefined })) }}
          placeholder="85000"
          type="number"
          inputMode="numeric"
          suffix="km"
          focused={focused === 'km'}
          onFocus={() => setFocused('km')}
          onBlur={() => setFocused(null)}
          error={!!errors.currentMileage}
        />
      </Field>

      <Field label="VIN (volitelné)">
        <TextInput
          value={form.vin}
          onChange={set('vin')}
          placeholder="WVW…"
          focused={focused === 'vin'}
          onFocus={() => setFocused('vin')}
          onBlur={() => setFocused(null)}
        />
      </Field>

      <Field label="Barva (volitelné)">
        <TextInput
          value={form.color}
          onChange={set('color')}
          placeholder="Stříbrná, Černá…"
          focused={focused === 'color'}
          onFocus={() => setFocused('color')}
          onBlur={() => setFocused(null)}
        />
      </Field>

      <Field label="Poznámky (volitelné)">
        <textarea
          value={form.notes}
          onChange={e => set('notes')(e.target.value)}
          placeholder="Libovolné poznámky…"
          rows={3}
          onFocus={() => setFocused('notes')}
          onBlur={() => setFocused(null)}
          style={{
            ...(focused === 'notes' ? inputFocusStyle : inputStyle),
            resize: 'none',
            lineHeight: '1.5',
          }}
        />
      </Field>

      <button
        type="button"
        onClick={handleSubmit}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #6c63ff, #4f9eff)',
          color: 'white',
          borderRadius: 14,
          padding: 16,
          fontSize: 16,
          fontWeight: 600,
          touchAction: 'manipulation',
          marginTop: 8,
        }}
      >
        {car ? 'Uložit změny' : 'Přidat auto'}
      </button>
    </div>
  )
}
