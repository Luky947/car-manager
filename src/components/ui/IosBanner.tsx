import { useState } from 'react'

const DISMISSED_KEY = 'cm_ios_banner'

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone =
  'standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true

export default function IosBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === '1'
  )

  if (!isIos || isStandalone || dismissed) return null

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 72,
        left: 16,
        right: 16,
        background: '#1e1d2e',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        zIndex: 200,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
        <path d="M12 2v13M8 7l4-5 4 5" />
        <path d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7" />
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginBottom: 4 }}>
          Přidat na plochu
        </div>
        <div style={{ fontSize: 12, color: '#9a9da8', lineHeight: 1.5 }}>
          Pro připomenutí servisu přidej appku na plochu: klepni na{' '}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9a9da8" strokeWidth="2" strokeLinecap="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
            <path d="M12 2v13M8 7l4-5 4 5" /><path d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7" />
          </svg>
          {' '}a vyber „Přidat na plochu".
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        style={{ background: 'none', border: 'none', padding: 4, color: '#5c6070', flexShrink: 0, fontSize: 18, lineHeight: 1, cursor: 'pointer' }}
        aria-label="Zavřít"
      >
        ×
      </button>
    </div>
  )
}
