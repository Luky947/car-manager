interface Option {
  label: string
  value: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (value: string) => void
}

export default function SegmentedControl({ options, value, onChange }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        background: '#1e1d2e',
        borderRadius: 12,
        padding: 4,
        gap: 2,
      }}
    >
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: '7px 4px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              color: active ? '#ffffff' : '#9a9da8',
              background: active ? 'linear-gradient(135deg, #6c63ff, #4f9eff)' : 'transparent',
              transition: 'all 150ms ease',
              touchAction: 'manipulation',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
