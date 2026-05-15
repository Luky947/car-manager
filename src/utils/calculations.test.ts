import { describe, it, expect } from 'vitest'
import { getCurrentMileage, calculateConsumption } from './calculations'
import { getReminderStatus, cleanupDeletedRecords } from './reminders'
import type { Car, ServiceRecord, FuelRecord } from '../types'

const baseCar: Car = {
  id: 'car1',
  name: 'Test',
  brand: 'Škoda',
  model: 'Octavia',
  year: 2019,
  licensePlate: '1AB2345',
  vin: null,
  fuelType: 'petrol',
  currentMileage: 85000,
  color: null,
  notes: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

function makeService(overrides: Partial<ServiceRecord> = {}): ServiceRecord {
  return {
    id: 's1',
    carId: 'car1',
    type: 'oil_change',
    date: '2024-01-01',
    mileage: 80000,
    cost: null,
    garage: null,
    notes: '',
    nextServiceDate: null,
    nextServiceMileage: null,
    reminderEnabled: true,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeFuel(overrides: Partial<FuelRecord> = {}): FuelRecord {
  return {
    id: 'f1',
    carId: 'car1',
    date: '2024-01-01',
    mileage: 80000,
    liters: 40,
    pricePerLiter: 38,
    totalCost: 1520,
    fullTank: true,
    notes: null,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// getCurrentMileage

describe('getCurrentMileage', () => {
  it('returns car.currentMileage when no records exist', () => {
    expect(getCurrentMileage(baseCar, [], [])).toBe(85000)
  })

  it('returns max across all records', () => {
    const service = makeService({ mileage: 90000 })
    const fuel = makeFuel({ mileage: 88000 })
    expect(getCurrentMileage(baseCar, [service], [fuel])).toBe(90000)
  })

  it('ignores soft-deleted service records', () => {
    const deleted = makeService({ mileage: 99000, deletedAt: '2024-06-01T00:00:00.000Z' })
    expect(getCurrentMileage(baseCar, [deleted], [])).toBe(85000)
  })

  it('ignores soft-deleted fuel records', () => {
    const deleted = makeFuel({ mileage: 99000, deletedAt: '2024-06-01T00:00:00.000Z' })
    expect(getCurrentMileage(baseCar, [], [deleted])).toBe(85000)
  })

  it('ignores records from other cars', () => {
    const other = makeService({ carId: 'car2', mileage: 99000 })
    expect(getCurrentMileage(baseCar, [other], [])).toBe(85000)
  })
})

// calculateConsumption

describe('calculateConsumption', () => {
  it('returns 0 when no records', () => {
    expect(calculateConsumption([])).toBe(0)
  })

  it('returns 0 when fewer than 2 fullTank records', () => {
    const records = [
      makeFuel({ id: 'f1', mileage: 80000, fullTank: true }),
      makeFuel({ id: 'f2', mileage: 80500, fullTank: false, liters: 20 }),
    ]
    expect(calculateConsumption(records)).toBe(0)
  })

  it('returns 0 when no fullTank records at all', () => {
    const records = [
      makeFuel({ id: 'f1', mileage: 80000, fullTank: false }),
      makeFuel({ id: 'f2', mileage: 80500, fullTank: false }),
    ]
    expect(calculateConsumption(records)).toBe(0)
  })

  it('calculates consumption for basic case — 2 full tanks', () => {
    // 500 km, 50 liters → 10 l/100km
    const records = [
      makeFuel({ id: 'f1', mileage: 80000, liters: 50, fullTank: true }),
      makeFuel({ id: 'f2', mileage: 80500, liters: 50, fullTank: true }),
    ]
    expect(calculateConsumption(records)).toBeCloseTo(10)
  })

  it('handles mix of fullTank and partial records', () => {
    // full at 80000, then partial 20L at 80300, full 35L at 80600
    // segment: total 55L over 600km → 9.166...
    const records = [
      makeFuel({ id: 'f1', mileage: 80000, liters: 45, fullTank: true }),
      makeFuel({ id: 'f2', mileage: 80300, liters: 20, fullTank: false }),
      makeFuel({ id: 'f3', mileage: 80600, liters: 35, fullTank: true }),
    ]
    const expected = (55 / 600) * 100
    expect(calculateConsumption(records)).toBeCloseTo(expected)
  })

  it('ignores soft-deleted records', () => {
    const records = [
      makeFuel({ id: 'f1', mileage: 80000, liters: 50, fullTank: true }),
      makeFuel({ id: 'f2', mileage: 80500, liters: 50, fullTank: true, deletedAt: '2024-06-01T00:00:00.000Z' }),
    ]
    expect(calculateConsumption(records)).toBe(0)
  })
})

// getReminderStatus

describe('getReminderStatus', () => {
  const now = new Date()

  function pastDate(days: number): string {
    return new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10)
  }
  function futureDate(days: number): string {
    return new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10)
  }

  it('returns overdue when nextServiceDate is in the past', () => {
    const r = makeService({ nextServiceDate: pastDate(5) })
    expect(getReminderStatus(r, 85000)).toBe('overdue')
  })

  it('returns overdue when nextServiceMileage is exceeded', () => {
    const r = makeService({ nextServiceMileage: 84000 })
    expect(getReminderStatus(r, 85000)).toBe('overdue')
  })

  it('returns soon when nextServiceDate is within 30 days', () => {
    const r = makeService({ nextServiceDate: futureDate(28) })
    expect(getReminderStatus(r, 85000)).toBe('soon')
  })

  it('returns soon when nextServiceMileage is within 500 km', () => {
    const r = makeService({ nextServiceMileage: 85400 })
    expect(getReminderStatus(r, 85000)).toBe('soon')
  })

  it('returns ok when date is more than 30 days away', () => {
    const r = makeService({ nextServiceDate: futureDate(90) })
    expect(getReminderStatus(r, 85000)).toBe('ok')
  })

  it('returns ok when mileage is more than 500 km away', () => {
    const r = makeService({ nextServiceMileage: 90000 })
    expect(getReminderStatus(r, 85000)).toBe('ok')
  })

  it('returns none when no nextServiceDate and no nextServiceMileage', () => {
    const r = makeService({ nextServiceDate: null, nextServiceMileage: null })
    expect(getReminderStatus(r, 85000)).toBe('none')
  })
})

// cleanupDeletedRecords

describe('cleanupDeletedRecords', () => {
  it('keeps active (non-deleted) records', () => {
    const records = [makeService({ id: 's1', deletedAt: null })]
    expect(cleanupDeletedRecords(records)).toHaveLength(1)
  })

  it('keeps recently deleted records (within 30 days)', () => {
    const recent = new Date(Date.now() - 10 * 86400000).toISOString()
    const records = [makeService({ deletedAt: recent })]
    expect(cleanupDeletedRecords(records)).toHaveLength(1)
  })

  it('removes records deleted more than 30 days ago', () => {
    const old = new Date(Date.now() - 31 * 86400000).toISOString()
    const records = [makeService({ deletedAt: old })]
    expect(cleanupDeletedRecords(records)).toHaveLength(0)
  })

  it('handles mixed active and old-deleted records', () => {
    const old = new Date(Date.now() - 45 * 86400000).toISOString()
    const records = [
      makeService({ id: 's1', deletedAt: null }),
      makeService({ id: 's2', deletedAt: old }),
    ]
    const result = cleanupDeletedRecords(records)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('s1')
  })
})
