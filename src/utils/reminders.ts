import type { ServiceRecord, ReminderStatus } from '../types'

export function getReminderStatus(
  record: ServiceRecord,
  currentMileage: number
): ReminderStatus {
  const now = new Date()

  if (record.nextServiceDate) {
    const dueDate = new Date(record.nextServiceDate)
    const diffDays = (dueDate.getTime() - now.getTime()) / 86400000
    if (diffDays < 0) return 'overdue'
    if (diffDays <= 30) return 'soon'
  }

  if (record.nextServiceMileage) {
    const diffKm = record.nextServiceMileage - currentMileage
    if (diffKm < 0) return 'overdue'
    if (diffKm <= 500) return 'soon'
  }

  if (!record.nextServiceDate && !record.nextServiceMileage) return 'none'
  return 'ok'
}

export function cleanupDeletedRecords<T extends { deletedAt: string | null }>(
  items: T[]
): T[] {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  return items.filter(
    item => !item.deletedAt || new Date(item.deletedAt) > thirtyDaysAgo
  )
}
