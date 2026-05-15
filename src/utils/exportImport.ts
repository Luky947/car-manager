import type { Car, ServiceRecord, FuelRecord, Document } from '../types'
import { getCars, saveCars, getServiceRecords, saveServiceRecords, getFuelRecords, saveFuelRecords, getDocuments, saveDocuments } from './storage'

export interface BackupPayload {
  version: number
  exportedAt: string
  cars: Car[]
  serviceRecords: ServiceRecord[]
  fuelRecords: FuelRecord[]
  documents: Document[]
}

export function buildPayload(): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    cars: getCars(),
    serviceRecords: getServiceRecords(),
    fuelRecords: getFuelRecords(),
    documents: getDocuments(),
  }
}

export function validatePayload(data: unknown): data is BackupPayload {
  if (!data || typeof data !== 'object') return false
  const p = data as Record<string, unknown>
  return (
    typeof p.version === 'number' &&
    Array.isArray(p.cars) &&
    Array.isArray(p.serviceRecords) &&
    Array.isArray(p.fuelRecords) &&
    Array.isArray(p.documents)
  )
}

export function applyPayload(payload: BackupPayload): void {
  saveCars(payload.cars)
  saveServiceRecords(payload.serviceRecords)
  saveFuelRecords(payload.fuelRecords)
  saveDocuments(payload.documents)
}

export function exportToJson(): void {
  const payload = buildPayload()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `car-manager-export-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importFromJson(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data: unknown = JSON.parse(text)
        if (!validatePayload(data)) {
          reject(new Error('Neplatný formát souboru'))
          return
        }
        if (!window.confirm('Tato akce přepíše všechna lokální data. Pokračovat?')) {
          resolve()
          return
        }
        applyPayload(data)
        window.location.reload()
        resolve()
      } catch {
        reject(new Error('Nepodařilo se načíst soubor'))
      }
    }
    reader.onerror = () => reject(new Error('Nepodařilo se přečíst soubor'))
    reader.readAsText(file)
  })
}
