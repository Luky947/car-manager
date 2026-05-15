import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Car } from '../types'
import { getCars, saveCars } from '../utils/storage'

interface CarStore {
  cars: Car[]
  activeCar: Car | null
  addCar: (data: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateCar: (id: string, data: Partial<Omit<Car, 'id' | 'createdAt'>>) => void
  deleteCar: (id: string) => void
  setActiveCar: (car: Car | null) => void
}

export const useCarStore = create<CarStore>((set, get) => {
  const cars = getCars()
  const activeCar = cars.length > 0 ? cars[0] : null

  return {
    cars,
    activeCar,

    addCar(data) {
      const now = new Date().toISOString()
      const car: Car = { ...data, id: uuidv4(), createdAt: now, updatedAt: now }
      const updated = [...get().cars, car]
      saveCars(updated)
      set(state => ({
        cars: updated,
        activeCar: state.activeCar ?? car,
      }))
    },

    updateCar(id, data) {
      const now = new Date().toISOString()
      const updated = get().cars.map(c =>
        c.id === id ? { ...c, ...data, updatedAt: now } : c
      )
      saveCars(updated)
      const activeCar = get().activeCar
      set({
        cars: updated,
        activeCar: activeCar?.id === id ? updated.find(c => c.id === id) ?? null : activeCar,
      })
    },

    deleteCar(id) {
      const updated = get().cars.filter(c => c.id !== id)
      saveCars(updated)
      const activeCar = get().activeCar
      set({
        cars: updated,
        activeCar: activeCar?.id === id ? (updated[0] ?? null) : activeCar,
      })
    },

    setActiveCar(car) {
      set({ activeCar: car })
    },
  }
})
