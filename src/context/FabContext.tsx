import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Car } from '../types'

interface FabContextValue {
  carFormOpen: boolean
  editingCar: Car | null
  openCarForm: (car?: Car) => void
  closeCarForm: () => void
  fabChoiceOpen: boolean
  openFabChoice: () => void
  closeFabChoice: () => void
}

const FabContext = createContext<FabContextValue | null>(null)

export function FabProvider({ children }: { children: ReactNode }) {
  const [carFormOpen, setCarFormOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [fabChoiceOpen, setFabChoiceOpen] = useState(false)

  return (
    <FabContext.Provider
      value={{
        carFormOpen,
        editingCar,
        openCarForm: (car) => {
          setEditingCar(car ?? null)
          setCarFormOpen(true)
        },
        closeCarForm: () => {
          setCarFormOpen(false)
          setEditingCar(null)
        },
        fabChoiceOpen,
        openFabChoice: () => setFabChoiceOpen(true),
        closeFabChoice: () => setFabChoiceOpen(false),
      }}
    >
      {children}
    </FabContext.Provider>
  )
}

export function useFab() {
  const ctx = useContext(FabContext)
  if (!ctx) throw new Error('useFab must be used within FabProvider')
  return ctx
}
