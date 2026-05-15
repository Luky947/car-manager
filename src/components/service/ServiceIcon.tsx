import type { ServiceType } from '../../types'

interface Props {
  type: ServiceType
  size?: number
  color?: string
}

export default function ServiceIcon({ type, size = 20, color = '#6c63ff' }: Props) {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth: 1.5,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }

  switch (type) {
    case 'oil_change':
      return <svg {...p}><path d="M12 2 C8 2 5 6 5 10 c0 5 7 12 7 12 s7-7 7-12 c0-4-3-8-7-8z"/></svg>

    case 'tire_change':
      return <svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>

    case 'brake_inspection':
      return <svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>

    case 'technical_inspection':
      return <svg {...p}><rect x="8" y="2" width="8" height="4" rx="1"/><rect x="4" y="4" width="16" height="18" rx="2"/><path d="M9 12 l2 2 4-4"/></svg>

    case 'emission_test':
      return <svg {...p}><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>

    case 'battery':
      return <svg {...p}><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M7 7V5M17 7V5"/><path d="M12 11v4M10 13h4"/></svg>

    case 'filter':
      return <svg {...p}><path d="M3 4h18l-7 8v6l-4-2V12L3 4z"/></svg>

    case 'timing_belt':
      return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>

    case 'coolant':
      return <svg {...p}><path d="M12 2v10"/><path d="M8 18a4 4 0 008 0"/><line x1="12" y1="12" x2="12" y2="18"/></svg>

    case 'brake_fluid':
      return <svg {...p}><rect x="8" y="6" width="8" height="14" rx="2"/><path d="M10 6V4h4v2"/></svg>

    case 'ac_service':
      return <svg {...p}><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/></svg>

    case 'windshield':
      return <svg {...p}><path d="M3 12 C3 7 7 4 12 4 s9 3 9 8"/><path d="M5 12h14"/></svg>

    case 'insurance':
      return <svg {...p}><path d="M12 2 L4 6v6c0 5 4 9 8 10c4-1 8-5 8-10V6L12 2z"/></svg>

    case 'registration':
      return <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 10h8M8 14h6"/></svg>

    case 'other':
      return <svg {...p}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
  }
}
