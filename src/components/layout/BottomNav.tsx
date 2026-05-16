import { useLocation, useNavigate } from 'react-router-dom'
import { useFab } from '../../context/FabContext'

function IconHome({ active }: { active: boolean }) {
  const c = active ? '#e8e8e8' : '#9a9da8'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function IconWrench({ active }: { active: boolean }) {
  const c = active ? '#e8e8e8' : '#9a9da8'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function IconFuel({ active }: { active: boolean }) {
  const c = active ? '#e8e8e8' : '#9a9da8'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16" />
      <path d="M3 22h12M14 10h2a2 2 0 012 2v3a1 1 0 001 1 1 1 0 001-1V8l-3-3" />
      <path d="M7 8h4M7 12h4" />
    </svg>
  )
}

function IconSettings({ active }: { active: boolean }) {
  const c = active ? '#e8e8e8' : '#9a9da8'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

function IconDoc({ active }: { active: boolean }) {
  const c = active ? '#e8e8e8' : '#9a9da8'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

const tabs = [
  { path: '/', label: 'Přehled', Icon: IconHome },
  { path: '/service', label: 'Servis', Icon: IconWrench },
  { path: '/fuel', label: 'Palivo', Icon: IconFuel },
  { path: '/documents', label: 'Doklady', Icon: IconDoc },
  { path: '/settings', label: 'Nastavení', Icon: IconSettings },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { openFabChoice, openServiceForm, openFuelForm, openDocumentForm } = useFab()

  const currentPath = location.pathname

  function handleFab() {
    if (currentPath === '/service') {
      openServiceForm()
    } else if (currentPath === '/fuel') {
      openFuelForm()
    } else if (currentPath === '/documents') {
      openDocumentForm()
    } else {
      openFabChoice()
    }
  }

  const leftTabs = tabs.slice(0, 2)         // Přehled, Servis
  const rightTabs = [tabs[2], tabs[4]]      // Palivo, Nastavení (Doklady přeskočeny)

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(64px + env(safe-area-inset-bottom))',
        background: '#13151a',
        borderTop: '0.5px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50,
      }}
    >
      {/* Left tabs */}
      {leftTabs.map(({ path, label, Icon }) => {
        const active = path === '/' ? currentPath === '/' : currentPath.startsWith(path)
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              height: '100%',
              touchAction: 'manipulation',
              transition: 'transform 100ms',
            }}
            onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onPointerUp={e => (e.currentTarget.style.transform = '')}
            onPointerLeave={e => (e.currentTarget.style.transform = '')}
          >
            <Icon active={active} />
            <span style={{ fontSize: 10, color: active ? '#e8e8e8' : '#9a9da8', fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
          </button>
        )
      })}

      {/* FAB */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          onClick={handleFab}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#e8e8e8',
            boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation',
            transition: 'transform 100ms',
            flexShrink: 0,
          }}
          onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
          onPointerUp={e => (e.currentTarget.style.transform = '')}
          onPointerLeave={e => (e.currentTarget.style.transform = '')}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Right tabs */}
      {rightTabs.map(({ path, label, Icon }) => {
        const active = currentPath.startsWith(path)
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              height: '100%',
              touchAction: 'manipulation',
              transition: 'transform 100ms',
            }}
            onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onPointerUp={e => (e.currentTarget.style.transform = '')}
            onPointerLeave={e => (e.currentTarget.style.transform = '')}
          >
            <Icon active={active} />
            <span style={{ fontSize: 10, color: active ? '#e8e8e8' : '#9a9da8', fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
