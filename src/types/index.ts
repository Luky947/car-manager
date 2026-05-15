export type ServiceType =
  | 'oil_change'
  | 'tire_change'
  | 'brake_inspection'
  | 'technical_inspection'
  | 'emission_test'
  | 'battery'
  | 'filter'
  | 'timing_belt'
  | 'coolant'
  | 'brake_fluid'
  | 'ac_service'
  | 'windshield'
  | 'insurance'
  | 'registration'
  | 'other'

export type ReminderStatus = 'ok' | 'soon' | 'overdue' | 'none'

export interface Car {
  id: string
  name: string
  brand: string
  model: string
  year: number
  licensePlate: string
  vin: string | null
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg'
  currentMileage: number
  color: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ServiceRecord {
  id: string
  carId: string
  type: ServiceType
  date: string
  mileage: number
  cost: number | null
  garage: string | null
  notes: string
  nextServiceDate: string | null
  nextServiceMileage: number | null
  reminderEnabled: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface FuelRecord {
  id: string
  carId: string
  date: string
  mileage: number
  liters: number
  pricePerLiter: number
  totalCost: number
  fullTank: boolean
  notes: string | null
  deletedAt: string | null
  createdAt: string
}

export interface Document {
  id: string
  carId: string
  type: 'insurance' | 'registration' | 'warranty' | 'invoice' | 'other'
  title: string
  expiryDate: string | null
  driveFileId: string | null
  notes: string | null
  deletedAt: string | null
  createdAt: string
}
