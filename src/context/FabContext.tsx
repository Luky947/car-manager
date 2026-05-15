import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Car, ServiceRecord, FuelRecord, Document } from '../types'

interface FabContextValue {
  carFormOpen: boolean
  editingCar: Car | null
  openCarForm: (car?: Car) => void
  closeCarForm: () => void
  fabChoiceOpen: boolean
  openFabChoice: () => void
  closeFabChoice: () => void
  serviceFormOpen: boolean
  editingService: ServiceRecord | null
  openServiceForm: (record?: ServiceRecord) => void
  closeServiceForm: () => void
  fuelFormOpen: boolean
  editingFuel: FuelRecord | null
  openFuelForm: (record?: FuelRecord) => void
  closeFuelForm: () => void
  documentFormOpen: boolean
  editingDocument: Document | null
  openDocumentForm: (doc?: Document) => void
  closeDocumentForm: () => void
}

const FabContext = createContext<FabContextValue | null>(null)

export function FabProvider({ children }: { children: ReactNode }) {
  const [carFormOpen, setCarFormOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [fabChoiceOpen, setFabChoiceOpen] = useState(false)
  const [serviceFormOpen, setServiceFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null)
  const [fuelFormOpen, setFuelFormOpen] = useState(false)
  const [editingFuel, setEditingFuel] = useState<FuelRecord | null>(null)
  const [documentFormOpen, setDocumentFormOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)

  return (
    <FabContext.Provider
      value={{
        carFormOpen,
        editingCar,
        openCarForm: (car) => { setEditingCar(car ?? null); setCarFormOpen(true) },
        closeCarForm: () => { setCarFormOpen(false); setEditingCar(null) },
        fabChoiceOpen,
        openFabChoice: () => setFabChoiceOpen(true),
        closeFabChoice: () => setFabChoiceOpen(false),
        serviceFormOpen,
        editingService,
        openServiceForm: (record) => { setEditingService(record ?? null); setServiceFormOpen(true) },
        closeServiceForm: () => { setServiceFormOpen(false); setEditingService(null) },
        fuelFormOpen,
        editingFuel,
        openFuelForm: (record) => { setEditingFuel(record ?? null); setFuelFormOpen(true) },
        closeFuelForm: () => { setFuelFormOpen(false); setEditingFuel(null) },
        documentFormOpen,
        editingDocument,
        openDocumentForm: (doc) => { setEditingDocument(doc ?? null); setDocumentFormOpen(true) },
        closeDocumentForm: () => { setDocumentFormOpen(false); setEditingDocument(null) },
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
