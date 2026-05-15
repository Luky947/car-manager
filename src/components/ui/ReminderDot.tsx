import type { ReminderStatus } from '../../types'

const colors: Record<ReminderStatus, string> = {
  ok: '#22c55e',
  soon: '#f59e0b',
  overdue: '#ef4444',
  none: '#3a3d47',
}

interface Props {
  status: ReminderStatus
}

export default function ReminderDot({ status }: Props) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: colors[status],
        flexShrink: 0,
        animation: status === 'overdue' ? 'pulse-dot 1.5s infinite' : undefined,
      }}
    />
  )
}
