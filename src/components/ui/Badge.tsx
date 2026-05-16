type BadgeColor = 'green' | 'amber' | 'red' | 'purple' | 'default'

const styles: Record<BadgeColor, { background: string; color: string }> = {
  green: { background: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  amber: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  red: { background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  purple: { background: 'rgba(255,255,255,0.08)', color: '#e8e8e8' },
  default: { background: 'rgba(255,255,255,0.08)', color: '#9a9da8' },
}

interface Props {
  label: string
  color?: BadgeColor
}

export default function Badge({ label, color = 'default' }: Props) {
  const s = styles[color]
  return (
    <span
      style={{
        display: 'inline-block',
        background: s.background,
        color: s.color,
        fontSize: 11,
        fontWeight: 500,
        padding: '3px 8px',
        borderRadius: 20,
        whiteSpace: 'nowrap',
        border: '0.5px solid rgba(255,255,255,0.15)',
      }}
    >
      {label}
    </span>
  )
}
