import type { Car, ServiceRecord, FuelRecord, Document } from '../types'

const KEYS = {
  cars: 'cm_cars',
  service: 'cm_service',
  fuel: 'cm_fuel',
  documents: 'cm_documents',
} as const

function getAll<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function save<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items))
}

export function getCars(): Car[] {
  return getAll<Car>(KEYS.cars)
}

export function saveCars(cars: Car[]): void {
  save(KEYS.cars, cars)
}

export function getServiceRecords(): ServiceRecord[] {
  return getAll<ServiceRecord>(KEYS.service)
}

export function saveServiceRecords(records: ServiceRecord[]): void {
  save(KEYS.service, records)
}

export function getFuelRecords(): FuelRecord[] {
  return getAll<FuelRecord>(KEYS.fuel)
}

export function saveFuelRecords(records: FuelRecord[]): void {
  save(KEYS.fuel, records)
}

export function getDocuments(): Document[] {
  return getAll<Document>(KEYS.documents)
}

export function saveDocuments(docs: Document[]): void {
  save(KEYS.documents, docs)
}
