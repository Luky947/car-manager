import { v4 as uuidv4 } from 'uuid'
import type { Car, ServiceRecord, FuelRecord, Document } from '../types'
import { getCars, saveCars, saveServiceRecords, saveFuelRecords, saveDocuments } from './storage'
import { useCarStore } from '../stores/useCarStore'
import { useServiceStore } from '../stores/useServiceStore'
import { useFuelStore } from '../stores/useFuelStore'
import { useDocumentStore } from '../stores/useDocumentStore'

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
}

export function applySeedIfEmpty(): void {
  if (getCars().length > 0) return

  const now = new Date().toISOString()
  const carId = uuidv4()

  const car: Car = {
    id: carId,
    name: 'Octavia',
    brand: 'Škoda',
    model: 'Octavia',
    year: 2019,
    licensePlate: '1AB2345',
    vin: null,
    fuelType: 'petrol',
    currentMileage: 85000,
    color: 'šedá',
    notes: '',
    createdAt: now,
    updatedAt: now,
  }

  const serviceRecords: ServiceRecord[] = [
    {
      id: uuidv4(),
      carId,
      type: 'oil_change',
      date: daysAgo(90),
      mileage: 83000,
      cost: 1800,
      garage: 'Autoservis Novák',
      notes: '',
      nextServiceDate: daysFromNow(270),
      nextServiceMileage: 93000,
      reminderEnabled: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      carId,
      type: 'technical_inspection',
      date: daysAgo(180),
      mileage: 80000,
      cost: 900,
      garage: null,
      notes: 'STK bez závad',
      nextServiceDate: daysFromNow(365),
      nextServiceMileage: null,
      reminderEnabled: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      carId,
      type: 'tire_change',
      date: daysAgo(180),
      mileage: 80500,
      cost: 600,
      garage: null,
      notes: 'Zimní → letní',
      nextServiceDate: null,
      nextServiceMileage: null,
      reminderEnabled: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      carId,
      type: 'brake_fluid',
      date: daysAgo(500),
      mileage: 72000,
      cost: 700,
      garage: null,
      notes: '',
      nextServiceDate: daysAgo(60),
      nextServiceMileage: null,
      reminderEnabled: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      carId,
      type: 'timing_belt',
      date: daysAgo(700),
      mileage: 65000,
      cost: 8500,
      garage: 'Autoservis Novák',
      notes: '',
      nextServiceDate: daysFromNow(20),
      nextServiceMileage: 145000,
      reminderEnabled: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ]

  const fuelRecords: FuelRecord[] = [
    { id: uuidv4(), carId, date: daysAgo(120), mileage: 82000, liters: 45, pricePerLiter: 38.5, totalCost: 1732.5, fullTank: true, notes: null, deletedAt: null, createdAt: now },
    { id: uuidv4(), carId, date: daysAgo(105), mileage: 82480, liters: 20, pricePerLiter: 38.9, totalCost: 778, fullTank: false, notes: null, deletedAt: null, createdAt: now },
    { id: uuidv4(), carId, date: daysAgo(90), mileage: 82950, liters: 42, pricePerLiter: 39.2, totalCost: 1646.4, fullTank: true, notes: null, deletedAt: null, createdAt: now },
    { id: uuidv4(), carId, date: daysAgo(75), mileage: 83400, liters: 18, pricePerLiter: 37.8, totalCost: 680.4, fullTank: false, notes: null, deletedAt: null, createdAt: now },
    { id: uuidv4(), carId, date: daysAgo(60), mileage: 83900, liters: 44, pricePerLiter: 38.0, totalCost: 1672, fullTank: true, notes: 'dálnice', deletedAt: null, createdAt: now },
    { id: uuidv4(), carId, date: daysAgo(45), mileage: 84350, liters: 22, pricePerLiter: 39.5, totalCost: 869, fullTank: false, notes: null, deletedAt: null, createdAt: now },
    { id: uuidv4(), carId, date: daysAgo(30), mileage: 84780, liters: 41, pricePerLiter: 38.2, totalCost: 1566.2, fullTank: true, notes: null, deletedAt: null, createdAt: now },
    { id: uuidv4(), carId, date: daysAgo(10), mileage: 85200, liters: 25, pricePerLiter: 38.7, totalCost: 967.5, fullTank: false, notes: null, deletedAt: null, createdAt: now },
  ]

  const documents: Document[] = [
    {
      id: uuidv4(),
      carId,
      type: 'insurance',
      title: 'Povinné ručení 2026',
      expiryDate: daysFromNow(25),
      driveFileId: null,
      notes: null,
      deletedAt: null,
      createdAt: now,
    },
    {
      id: uuidv4(),
      carId,
      type: 'registration',
      title: 'Technický průkaz',
      expiryDate: daysFromNow(365),
      driveFileId: null,
      notes: null,
      deletedAt: null,
      createdAt: now,
    },
  ]

  saveCars([car])
  saveServiceRecords(serviceRecords)
  saveFuelRecords(fuelRecords)
  saveDocuments(documents)

  // Stores were already initialized with [] before this function ran,
  // so we must update their in-memory state directly.
  useCarStore.setState({ cars: [car], activeCar: car })
  useServiceStore.setState({ records: serviceRecords })
  useFuelStore.setState({ records: fuelRecords })
  useDocumentStore.setState({ documents })
}
