import { useCarStore } from '../stores/useCarStore'
import { useServiceStore } from '../stores/useServiceStore'
import { useFuelStore } from '../stores/useFuelStore'
import { getCurrentMileage } from '../utils/calculations'
import { getReminderStatus } from '../utils/reminders'
import type { ServiceRecord, ReminderStatus } from '../types'

const statusOrder: Record<ReminderStatus, number> = {
  overdue: 0,
  soon: 1,
  ok: 2,
  none: 3,
}

export function useReminders(): ServiceRecord[] {
  const activeCar = useCarStore(s => s.activeCar)
  const serviceRecords = useServiceStore(s => s.records)
  const fuelRecords = useFuelStore(s => s.records)

  if (!activeCar) return []

  const mileage = getCurrentMileage(activeCar, serviceRecords, fuelRecords)

  return serviceRecords
    .filter(r => r.carId === activeCar.id && r.reminderEnabled && !r.deletedAt)
    .sort((a, b) => {
      const sa = statusOrder[getReminderStatus(a, mileage)]
      const sb = statusOrder[getReminderStatus(b, mileage)]
      return sa - sb
    })
}
