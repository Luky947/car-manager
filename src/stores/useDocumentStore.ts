import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Document } from '../types'
import { getDocuments, saveDocuments } from '../utils/storage'

interface DocumentStore {
  documents: Document[]
  addDocument: (data: Omit<Document, 'id' | 'createdAt' | 'deletedAt'>) => void
  updateDocument: (id: string, data: Partial<Omit<Document, 'id' | 'createdAt'>>) => void
  softDeleteDocument: (id: string) => void
}

export const useDocumentStore = create<DocumentStore>(() => {
  const documents = getDocuments()

  return {
    documents,

    addDocument(data) {
      const now = new Date().toISOString()
      const doc: Document = { ...data, id: uuidv4(), deletedAt: null, createdAt: now }
      useDocumentStore.setState(state => {
        const updated = [...state.documents, doc]
        saveDocuments(updated)
        return { documents: updated }
      })
    },

    updateDocument(id, data) {
      useDocumentStore.setState(state => {
        const updated = state.documents.map(d =>
          d.id === id ? { ...d, ...data } : d
        )
        saveDocuments(updated)
        return { documents: updated }
      })
    },

    softDeleteDocument(id) {
      const now = new Date().toISOString()
      useDocumentStore.setState(state => {
        const updated = state.documents.map(d =>
          d.id === id ? { ...d, deletedAt: now } : d
        )
        saveDocuments(updated)
        return { documents: updated }
      })
    },
  }
})
