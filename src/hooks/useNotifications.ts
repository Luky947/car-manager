import { useState } from 'react'
import { useCarStore } from '../stores/useCarStore'
import { useServiceStore } from '../stores/useServiceStore'
import { useFuelStore } from '../stores/useFuelStore'
import { getCurrentMileage } from '../utils/calculations'
import { getReminderStatus } from '../utils/reminders'
import type { ServiceRecord } from '../types'

const LAST_NOTIFY_KEY = 'cm_last_notify'

export const isNotificationSupported =
  typeof window !== 'undefined' &&
  'Notification' in window &&
  'serviceWorker' in navigator

const SERVICE_TYPE_LABELS: Record<string, string> = {
  oil_change: 'Výměna oleje',
  tire_change: 'Výměna pneumatik',
  brake_inspection: 'Brzdy',
  technical_inspection: 'STK',
  emission_test: 'Emise',
  battery: 'Baterie',
  filter: 'Filtr',
  timing_belt: 'Rozvodový řemen',
  coolant: 'Chladivo',
  brake_fluid: 'Brzdová kapalina',
  ac_service: 'Klimatizace',
  windshield: 'Sklo',
  insurance: 'Pojištění',
  registration: 'Registrace',
  other: 'Jiný servis',
}

async function sendViaServiceWorker(title: string, body: string, tag: string) {
  try {
    const reg = await navigator.serviceWorker.ready
    reg.active?.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag })
  } catch { /* SW unavailable — skip silently */ }
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    isNotificationSupported ? Notification.permission : 'denied'
  )

  const activeCar = useCarStore(s => s.activeCar)
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)

  async function requestPermission(): Promise<boolean> {
    if (!isNotificationSupported) return false
    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }

  async function scheduleReminders(records: ServiceRecord[]) {
    if (!isNotificationSupported || Notification.permission !== 'granted') return
    if (!activeCar) return
    const mileage = getCurrentMileage(activeCar, serviceRecords, fuelRecords)
    const toNotify = records
      .filter(r => {
        const s = getReminderStatus(r, mileage)
        return s === 'overdue' || s === 'soon'
      })
      .slice(0, 3)

    for (const r of toNotify) {
      const status = getReminderStatus(r, mileage)
      const label = SERVICE_TYPE_LABELS[r.type] ?? r.type
      const title = status === 'overdue' ? `${label} — po termínu` : `${label} — brzy`
      const body = r.nextServiceDate
        ? `Termín: ${new Date(r.nextServiceDate).toLocaleDateString('cs-CZ')}`
        : r.nextServiceMileage
        ? `Do: ${r.nextServiceMileage.toLocaleString('cs-CZ')} km`
        : label
      await sendViaServiceWorker(title, body, `reminder-${r.id}`)
    }
  }

  function checkAndNotify() {
    if (!isNotificationSupported || Notification.permission !== 'granted') return
    const today = new Date().toDateString()
    if (localStorage.getItem(LAST_NOTIFY_KEY) === today) return
    localStorage.setItem(LAST_NOTIFY_KEY, today)
    if (!activeCar) return
    const reminders = serviceRecords.filter(
      r => r.carId === activeCar.id && r.reminderEnabled && !r.deletedAt
    )
    void scheduleReminders(reminders)
  }

  return { isSupported: isNotificationSupported, permission, requestPermission, scheduleReminders, checkAndNotify }
}
