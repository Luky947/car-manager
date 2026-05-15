export function formatMileage(km: number): string {
  return km.toLocaleString('cs-CZ') + ' km'
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })
}

export function daysUntil(isoDate: string): number {
  return Math.round((new Date(isoDate).getTime() - Date.now()) / 86400000)
}
