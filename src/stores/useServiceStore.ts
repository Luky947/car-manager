import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { ServiceRecord } from '../types'
import { getServiceRecords, saveServiceRecords } from '../utils/storage'

interface ServiceStore {
  records: ServiceRecord[]
  addRecord: (data: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => void
  updateRecord: (id: string, data: Partial<Omit<ServiceRecord, 'id' | 'createdAt'>>) => void
  softDeleteRecord: (id: string) => void
}

export const useServiceStore = create<ServiceStore>(() => {
  const records = getServiceRecords()

  return {
    records,

    addRecord(data) {
      const now = new Date().toISOString()
      const record: ServiceRecord = { ...data, id: uuidv4(), deletedAt: null, createdAt: now, updatedAt: now }
      useServiceStore.setState(state => {
        const updated = [...state.records, record]
        saveServiceRecords(updated)
        return { records: updated }
      })
    },

    updateRecord(id, data) {
      const now = new Date().toISOString()
      useServiceStore.setState(state => {
        const updated = state.records.map(r =>
          r.id === id ? { ...r, ...data, updatedAt: now } : r
        )
        saveServiceRecords(updated)
        return { records: updated }
      })
    },

    softDeleteRecord(id) {
      const now = new Date().toISOString()
      useServiceStore.setState(state => {
        const updated = state.records.map(r =>
          r.id === id ? { ...r, deletedAt: now, updatedAt: now } : r
        )
        saveServiceRecords(updated)
        return { records: updated }
      })
    },
  }
})
