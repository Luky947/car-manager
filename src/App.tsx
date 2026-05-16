import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Service from './pages/Service'
import Fuel from './pages/Fuel'
import Documents from './pages/Documents'
import Settings from './pages/Settings'
import { FabProvider } from './context/FabContext'
import IosBanner from './components/ui/IosBanner'
import { applySeedIfEmpty } from './utils/seedData'
import { cleanupDeletedRecords } from './utils/reminders'
import { useServiceStore } from './stores/useServiceStore'
import { useFuelStore } from './stores/useFuelStore'
import { useDocumentStore } from './stores/useDocumentStore'
import { saveServiceRecords, saveFuelRecords, saveDocuments } from './utils/storage'
import { useNotifications } from './hooks/useNotifications'

function AppInit() {
  const { checkAndNotify } = useNotifications()

  useEffect(() => {
    applySeedIfEmpty()

    const { records: svc } = useServiceStore.getState()
    const cleanedSvc = cleanupDeletedRecords(svc)
    if (cleanedSvc.length !== svc.length) {
      useServiceStore.setState({ records: cleanedSvc })
      saveServiceRecords(cleanedSvc)
    }

    const { records: fuel } = useFuelStore.getState()
    const cleanedFuel = cleanupDeletedRecords(fuel)
    if (cleanedFuel.length !== fuel.length) {
      useFuelStore.setState({ records: cleanedFuel })
      saveFuelRecords(cleanedFuel)
    }

    const { documents: docs } = useDocumentStore.getState()
    const cleanedDocs = cleanupDeletedRecords(docs)
    if (cleanedDocs.length !== docs.length) {
      useDocumentStore.setState({ documents: cleanedDocs })
      saveDocuments(cleanedDocs)
    }

    checkAndNotify()
  }, [checkAndNotify])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <FabProvider>
        <AppInit />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="service" element={<Service />} />
            <Route path="fuel" element={<Fuel />} />
            <Route path="documents" element={<Documents />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <IosBanner />
      </FabProvider>
    </BrowserRouter>
  )
}
