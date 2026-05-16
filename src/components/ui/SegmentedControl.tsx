import { useEffect, useRef, useState } from 'react'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0, animate: false })
  const isFirst = useRef(true)

  useEffect(() => {
    if (!containerRef.current) return
    const idx = options.findIndex(o => o.value === value)
    const buttons = containerRef.current.querySelectorAll('button')
    const btn = buttons[idx] as HTMLButtonElement | undefined
    if (!btn) return

    if (isFirst.current) {
      isFirst.current = false
      setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth, animate: false })
      requestAnimationFrame(() => {
        setIndicator(prev => ({ ...prev, animate: true }))
      })
    } else {
      setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth, animate: true })
    }
  }, [value, options])

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        background: '#141414',
        border: '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        padding: 3,
        gap: 2,
        position: 'relative',
      }}
    >
      {/* Sliding indicator */}
      <div
        style={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          left: indicator.left,
          width: indicator.width,
          background: '#e8e8e8',
          borderRadius: 10,
          transition: indicator.animate
            ? 'left 250ms cubic-bezier(0.34, 1.56, 0.64, 1), width 250ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'none',
          pointerEvents: 'none',
          opacity: indicator.width > 0 ? 1 : 0,
        }}
      />

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
              fontWeight: active ? 500 : 400,
              color: active ? '#0a0a0a' : '#555',
              background: 'transparent',
              position: 'relative',
              zIndex: 1,
              transition: 'color 200ms cubic-bezier(0.2,0,0,1)',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
