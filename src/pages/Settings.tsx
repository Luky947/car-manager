import { useRef, useState, type ReactNode } from 'react'
import { useCarStore } from '../stores/useCarStore'
import { useFab } from '../context/FabContext'
import { useDriveBackup } from '../hooks/useDriveBackup'
import { useNotifications } from '../hooks/useNotifications'
import { exportToJson, importFromJson } from '../utils/exportImport'

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 13, color: '#888', paddingLeft: 4, marginBottom: 8 }}>{title}</p>
      <div style={{ background: '#1c1c1e', borderRadius: 16, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

interface RowProps {
  label: string
  labelColor?: string
  right?: ReactNode
  onPress?: () => void
  chevron?: boolean
  isLast?: boolean
  disabled?: boolean
}

function Row({ label, labelColor = '#f0f0f0', right, onPress, chevron, isLast, disabled }: RowProps) {
  const style: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '13px 16px',
    borderBottom: isLast ? 'none' : '0.5px solid rgba(255,255,255,0.06)',
    width: '100%',
    background: 'transparent',
    textAlign: 'left',
    fontFamily: 'inherit',
    opacity: disabled ? 0.5 : 1,
    touchAction: 'manipulation',
    cursor: onPress ? 'pointer' : 'default',
  }

  const inner = (
    <>
      <span style={{ fontSize: 16, color: labelColor }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {right}
        {chevron && (
          <svg width="7" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    </>
  )

  if (onPress) {
    return (
      <button type="button" onClick={onPress} disabled={disabled} style={style} className="pressable-subtle">
        {inner}
      </button>
    )
  }

  return <div style={style}>{inner}</div>
}

export default function Settings() {
  const cars = useCarStore(s => s.cars)
  const { openCarForm } = useFab()
  const drive = useDriveBackup()
  const { permission, isSupported, requestPermission } = useNotifications()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    try {
      await importFromJson(file)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import selhal')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function formatBackupDate(iso: string | null): string {
    if (!iso) return 'Nezálohováno'
    return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: '2-digit' })
  }

  const notifRight = !isSupported
    ? <span style={{ fontSize: 14, color: '#555' }}>Nepodporovány</span>
    : permission === 'granted'
    ? <span style={{ fontSize: 12, color: '#22c55e', background: 'rgba(34,197,94,0.12)', borderRadius: 6, padding: '2px 8px', fontWeight: 500 }}>Povoleny</span>
    : permission === 'denied'
    ? <span style={{ fontSize: 14, color: '#ef4444' }}>Zakázány</span>
    : <span style={{ fontSize: 16, color: '#e8e8e8' }}>Povolit →</span>

  return (
    <div style={{ padding: '56px 20px 40px', WebkitOverflowScrolling: 'touch' }}>
      {/* Pull indicator */}
      <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />

      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f0f0', marginBottom: 28 }}>Nastavení</h1>

      {/* Auta */}
      <Group title="Auta">
        {cars.map(car => (
          <Row
            key={car.id}
            label={`${car.brand} ${car.model}`}
            right={<span style={{ fontSize: 14, color: '#888' }}>{car.licensePlate}</span>}
            onPress={() => openCarForm(car)}
            chevron
          />
        ))}
        <Row
          label="Přidat auto"
          labelColor="#e8e8e8"
          onPress={() => openCarForm()}
          isLast
          right={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        />
      </Group>

      {/* Záloha */}
      <Group title="Záloha — Google Drive">
        {!drive.isSignedIn ? (
          <Row
            label="Google Drive"
            right={<span style={{ fontSize: 16, color: '#e8e8e8' }}>Připojit</span>}
            onPress={drive.signIn}
            isLast={!drive.error}
          />
        ) : (
          <>
            <Row
              label="Google Drive"
              right={
                <span style={{ fontSize: 13, color: '#888', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {drive.userEmail ?? 'Přihlášeno'}
                </span>
              }
            />
            <Row
              label={drive.isLoading ? 'Probíhá záloha…' : 'Zálohovat nyní'}
              right={<span style={{ fontSize: 13, color: '#555' }}>{formatBackupDate(drive.lastBackupAt)}</span>}
              onPress={drive.backup}
              disabled={drive.isLoading}
            />
            <Row
              label="Obnovit ze zálohy"
              labelColor="#f59e0b"
              onPress={drive.restore}
              disabled={drive.isLoading}
            />
            <Row
              label="Odpojit"
              labelColor="#ef4444"
              onPress={drive.signOut}
              disabled={drive.isLoading}
              isLast={!drive.error}
            />
          </>
        )}
        {drive.error && (
          <p style={{ fontSize: 12, color: '#ef4444', padding: '8px 16px 12px' }}>{drive.error}</p>
        )}
      </Group>

      {/* Export & Import */}
      <Group title="Export & Import">
        <Row
          label="Exportovat JSON"
          onPress={exportToJson}
          right={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          }
        />
        <Row
          label="Importovat JSON"
          onPress={() => fileInputRef.current?.click()}
          isLast={!importError}
          right={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          }
        />
        {importError && (
          <p style={{ fontSize: 12, color: '#ef4444', padding: '8px 16px 12px' }}>{importError}</p>
        )}
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
      </Group>

      {/* Notifikace */}
      <Group title="Notifikace">
        <Row
          label="Notifikace"
          right={notifRight}
          onPress={isSupported && permission === 'default' ? requestPermission : undefined}
          isLast
        />
      </Group>

      {/* O aplikaci */}
      <Group title="O aplikaci">
        <Row
          label="Verze"
          right={<span style={{ fontSize: 14, color: '#888' }}>1.0.0</span>}
        />
        <Row
          label="Car Manager"
          right={<span style={{ fontSize: 14, color: '#888' }}>© 2026</span>}
          isLast
        />
      </Group>
    </div>
  )
}
