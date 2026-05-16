import type { ServiceType } from '../types'

export const serviceTypeLabel: Record<ServiceType, string> = {
  oil_change: 'Výměna oleje',
  tire_change: 'Výměna pneumatik',
  brake_inspection: 'Brzdová kontrola',
  technical_inspection: 'STK',
  emission_test: 'Emise',
  battery: 'Baterie',
  filter: 'Filtr',
  timing_belt: 'Rozvod',
  coolant: 'Chladivo',
  brake_fluid: 'Brzdová kapalina',
  ac_service: 'Klimatizace',
  windshield: 'Sklo',
  insurance: 'Pojištění',
  registration: 'Registrace',
  other: 'Ostatní',
}

export const documentTypeLabel: Record<'insurance' | 'registration' | 'warranty' | 'invoice' | 'other', string> = {
  insurance: 'Pojištění',
  registration: 'Registrace',
  warranty: 'Záruka',
  invoice: 'Faktura',
  other: 'Ostatní',
}

export const fuelTypeLabel: Record<string, string> = {
  petrol: 'Benzín',
  diesel: 'Diesel',
  electric: 'Elektro',
  hybrid: 'Hybrid',
  lpg: 'LPG',
}
