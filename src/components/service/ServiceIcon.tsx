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
      return <svg {...p}><path d="M12 2c0 0-7 8-7 13a7 7 0 0014 0c0-5-7-13-7-13z"/></svg>

    case 'tire_change':
      return <svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/></svg>

    case 'brake_inspection':
      return <svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M7.76 7.76l2.83 2.83M13.41 13.41l2.83 2.83"/></svg>

    case 'brake_fluid':
      return <svg {...p}><path d="M9 3h6"/><path d="M8 6h8l1.5 13a1 1 0 01-1 1H7.5a1 1 0 01-1-1L8 6z"/><path d="M9 11h6"/></svg>

    case 'technical_inspection':
      return <svg {...p}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><polyline points="9 12 11 14 15 10"/></svg>

    case 'emission_test':
      return <svg {...p}><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>

    case 'timing_belt':
      return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>

    case 'battery':
      return <svg {...p}><rect x="1" y="7" width="18" height="10" rx="2"/><path d="M23 12v1M23 11v1"/><line x1="6" y1="11" x2="6" y2="13"/><line x1="10" y1="11" x2="10" y2="13"/></svg>

    case 'filter':
      return <svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>

    case 'coolant':
      return <svg {...p}><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg>

    case 'ac_service':
      return <svg {...p}><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><polyline points="15 5 12 2 9 5"/><polyline points="5 9 2 12 5 15"/><polyline points="9 19 12 22 15 19"/><polyline points="19 15 22 12 19 9"/></svg>

    case 'windshield':
      return <svg {...p}><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1.5l3 5H5v5z"/><path d="M19 17h2a2 2 0 002-2V9a2 2 0 00-2-2h-1.5l-3 5H19v5z"/><path d="M7.5 7l4.5 5 4.5-5"/></svg>

    case 'insurance':
      return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>

    case 'registration':
      return <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>

    case 'other':
      return <svg {...p}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
  }
}
