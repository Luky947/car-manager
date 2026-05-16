import type { Car, ServiceRecord, FuelRecord } from '../types'

export function getLastMileageRecord(
  serviceRecords: ServiceRecord[],
  fuelRecords: FuelRecord[],
  carId: string
): { mileage: number; date: string } | null {
  const allRecords = [
    ...serviceRecords
      .filter(r => r.carId === carId && !r.deletedAt)
      .map(r => ({ mileage: r.mileage, date: r.date })),
    ...fuelRecords
      .filter(r => r.carId === carId && !r.deletedAt)
      .map(r => ({ mileage: r.mileage, date: r.date })),
  ]

  if (allRecords.length === 0) return null

  return allRecords.reduce((max, r) => r.mileage > max.mileage ? r : max)
}

export function getCurrentMileage(
  car: Car,
  serviceRecords: ServiceRecord[],
  fuelRecords: FuelRecord[]
): number {
  const allMileages = [
    car.currentMileage,
    ...serviceRecords.filter(r => r.carId === car.id && !r.deletedAt).map(r => r.mileage),
    ...fuelRecords.filter(r => r.carId === car.id && !r.deletedAt).map(r => r.mileage),
  ]
  return Math.max(...allMileages)
}

export function calculateConsumption(records: FuelRecord[]): number {
  const sorted = [...records]
    .filter(r => !r.deletedAt)
    .sort((a, b) => a.mileage - b.mileage)

  const firstFullIdx = sorted.findIndex(r => r.fullTank)
  if (firstFullIdx === -1) return 0

  const segments: number[] = []
  let prevFull = sorted[firstFullIdx]
  let litersAccumulated = 0

  for (let i = firstFullIdx + 1; i < sorted.length; i++) {
    const r = sorted[i]
    litersAccumulated += r.liters
    if (r.fullTank) {
      const km = r.mileage - prevFull.mileage
      if (km > 0) segments.push((litersAccumulated / km) * 100)
      prevFull = r
      litersAccumulated = 0
    }
  }

  if (segments.length === 0) return 0
  return segments.reduce((a, b) => a + b) / segments.length
}
