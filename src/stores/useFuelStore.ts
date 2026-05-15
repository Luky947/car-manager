import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { FuelRecord } from '../types'
import { getFuelRecords, saveFuelRecords } from '../utils/storage'

interface FuelStore {
  records: FuelRecord[]
  addRecord: (data: Omit<FuelRecord, 'id' | 'createdAt' | 'deletedAt'>) => void
  updateRecord: (id: string, data: Partial<Omit<FuelRecord, 'id' | 'createdAt'>>) => void
  softDeleteRecord: (id: string) => void
}

export const useFuelStore = create<FuelStore>(() => {
  const records = getFuelRecords()

  return {
    records,

    addRecord(data) {
      const now = new Date().toISOString()
      const record: FuelRecord = { ...data, id: uuidv4(), deletedAt: null, createdAt: now }
      useFuelStore.setState(state => {
        const updated = [...state.records, record]
        saveFuelRecords(updated)
        return { records: updated }
      })
    },

    updateRecord(id, data) {
      useFuelStore.setState(state => {
        const updated = state.records.map(r =>
          r.id === id ? { ...r, ...data } : r
        )
        saveFuelRecords(updated)
        return { records: updated }
      })
    },

    softDeleteRecord(id) {
      const now = new Date().toISOString()
      useFuelStore.setState(state => {
        const updated = state.records.map(r =>
          r.id === id ? { ...r, deletedAt: now } : r
        )
        saveFuelRecords(updated)
        return { records: updated }
      })
    },
  }
})
