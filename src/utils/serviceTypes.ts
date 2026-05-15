import type { ServiceType } from '../types'

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  oil_change: 'Výměna oleje',
  tire_change: 'Pneumatiky',
  brake_inspection: 'Brzdy',
  technical_inspection: 'STK',
  emission_test: 'Emise',
  battery: 'Baterie',
  filter: 'Filtry',
  timing_belt: 'Rozvod',
  coolant: 'Chladivo',
  brake_fluid: 'Brzdová kapalina',
  ac_service: 'Klimatizace',
  windshield: 'Čelní sklo',
  insurance: 'Pojištění',
  registration: 'Registrace',
  other: 'Jiné',
}

export const ALL_SERVICE_TYPES: ServiceType[] = [
  'oil_change', 'tire_change', 'brake_inspection', 'brake_fluid',
  'technical_inspection', 'emission_test', 'timing_belt', 'battery',
  'filter', 'coolant', 'ac_service', 'windshield',
  'insurance', 'registration', 'other',
]

export const SERVICE_GROUPS: Record<string, ServiceType[] | null> = {
  all: null,
  service: ['oil_change', 'tire_change', 'brake_inspection', 'battery', 'filter', 'timing_belt', 'coolant', 'brake_fluid', 'ac_service', 'windshield'],
  docs: ['insurance', 'registration', 'technical_inspection', 'emission_test'],
  other: ['other'],
}
