import { useRef, useState } from 'react'
import { useCarStore } from '../stores/useCarStore'
import { useFab } from '../context/FabContext'
import { useDriveBackup } from '../hooks/useDriveBackup'
import { useNotifications } from '../hooks/useNotifications'
import { useReminders } from '../hooks/useReminders'
import { exportToJson, importFromJson } from '../utils/exportImport'
import CarCard from '../components/cars/CarCard'

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#5c6070',
  marginBottom: 12,
  fontWeight: 500,
}

const card: React.CSSProperties = {
  background: '#1e1d2e',
  borderRadius: 14,
  border: '0.5px solid rgba(255,255,255,0.06)',
  overflow: 'hidden',
  marginBottom: 8,
}

function ActionButton({
  label,
  onClick,
  disabled,
  variant = 'primary',
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}) {
  const styles: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    touchAction: 'manipulation',
    opacity: disabled ? 0.5 : 1,
    transition: 'opacity 150ms',
    ...(variant === 'primary' && {
      background: 'linear-gradient(135deg, #6c63ff, #4f9eff)',
      color: 'white',
      border: 'none',
    }),
    ...(variant === 'secondary' && {
      background: 'transparent',
      color: '#6c63ff',
      border: '1.5px solid #6c63ff',
    }),
    ...(variant === 'danger' && {
      background: 'transparent',
      color: '#ef4444',
      border: '1.5px solid #ef4444',
    }),
    ...(variant === 'ghost' && {
      background: 'transparent',
      color: '#ef4444',
      border: 'none',
    }),
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={styles}>
      {label}
    </button>
  )
}

export default function Settings() {
  const cars = useCarStore(s => s.cars)
  const { openCarForm } = useFab()
  const drive = useDriveBackup()
  const notifications = useNotifications()
  const reminders = useReminders()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [notifLoading, setNotifLoading] = useState(false)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    try {
      await importFromJson(file)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import selhal')
    }
    // Reset input so the same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function formatBackupDate(iso: string | null): string {
    if (!iso) return 'Zatím nezálohováno'
    return `Poslední záloha: ${new Date(iso).toLocaleString('cs-CZ', {
      day: 'numeric', month: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })}`
  }

  return (
    <div style={{ padding: '56px 20px 40px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0', marginBottom: 28 }}>Nastavení</h1>

      {/* ── Auta ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabel}>Auta</p>
        {cars.map(car => (
          <CarCard key={car.id} car={car} onPress={() => openCarForm(car)} />
        ))}
        <button
          type="button"
          onClick={() => openCarForm()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', background: 'transparent',
            border: '1px dashed rgba(255,255,255,0.15)',
            borderRadius: 14, padding: '14px 16px',
            fontSize: 14, fontWeight: 500, color: '#6c63ff',
            touchAction: 'manipulation', cursor: 'pointer',
            transition: 'opacity 150ms',
          }}
          onPointerDown={e => (e.currentTarget.style.opacity = '0.7')}
          onPointerUp={e => (e.currentTarget.style.opacity = '1')}
          onPointerLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Přidat auto
        </button>
      </div>

      {/* ── Google Drive ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabel}>Záloha — Google Drive</p>
        <div style={card}>
          <div style={{ padding: '16px 16px 20px' }}>

            {!drive.isSignedIn ? (
              <>
                <div style={{ fontSize: 13, color: '#9a9da8', marginBottom: 16, lineHeight: 1.5 }}>
                  Přihlas se pro automatickou zálohu do Google Drive.{' '}
                  Data jsou uložena v privátní složce appky — uživatel je nevidí ve svém Drive.
                </div>
                <ActionButton label="Připojit Google Drive" onClick={drive.signIn} />
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: '#9a9da8', marginBottom: 4 }}>
                  {drive.userEmail ?? 'Přihlášeno'}
                </div>
                <div style={{ fontSize: 12, color: '#5c6070', marginBottom: 16 }}>
                  {formatBackupDate(drive.lastBackupAt)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <ActionButton
                    label={drive.isLoading ? 'Probíhá záloha…' : 'Zálohovat nyní'}
                    onClick={drive.backup}
                    disabled={drive.isLoading}
                  />
                  <ActionButton
                    label={drive.isLoading ? 'Probíhá obnova…' : 'Obnovit ze zálohy'}
                    onClick={drive.restore}
                    disabled={drive.isLoading}
                    variant="secondary"
                  />
                  <ActionButton
                    label="Odpojit"
                    onClick={drive.signOut}
                    disabled={drive.isLoading}
                    variant="ghost"
                  />
                </div>
              </>
            )}

            {drive.error && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 10 }}>{drive.error}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Notifikace ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabel}>Notifikace</p>
        <div style={card}>
          <div style={{ padding: '16px 16px 20px' }}>
            {!notifications.isSupported ? (
              <div style={{ fontSize: 13, color: '#9a9da8', lineHeight: 1.5 }}>
                Notifikace nejsou v tomto prohlížeči podporovány.{' '}
                Na iOS přidej appku na plochu pro plnou podporu.
              </div>
            ) : notifications.permission === 'granted' ? (
              <>
                <div style={{ fontSize: 13, color: '#9a9da8', marginBottom: 16, lineHeight: 1.5 }}>
                  Notifikace jsou povoleny. Připomenutí servisu ti přijdou jednou denně.
                </div>
                <ActionButton
                  label={notifLoading ? 'Odesílám…' : 'Otestovat notifikaci'}
                  onClick={async () => {
                    setNotifLoading(true)
                    await notifications.scheduleReminders(reminders)
                    setNotifLoading(false)
                  }}
                  disabled={notifLoading || reminders.length === 0}
                  variant="secondary"
                />
                {reminders.length === 0 && (
                  <p style={{ fontSize: 12, color: '#5c6070', marginTop: 8 }}>
                    Žádná připomenutí nejsou aktivní.
                  </p>
                )}
              </>
            ) : notifications.permission === 'denied' ? (
              <div style={{ fontSize: 13, color: '#9a9da8', lineHeight: 1.5 }}>
                Notifikace jsou blokovány. Povol je v nastavení prohlížeče.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: '#9a9da8', marginBottom: 16, lineHeight: 1.5 }}>
                  Povol notifikace pro automatické připomenutí servisu.
                </div>
                <ActionButton
                  label="Povolit notifikace"
                  onClick={async () => {
                    setNotifLoading(true)
                    await notifications.requestPermission()
                    setNotifLoading(false)
                  }}
                  disabled={notifLoading}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Export & Import ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabel}>Export & Import</p>
        <div style={card}>
          <div style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ fontSize: 13, color: '#9a9da8', marginBottom: 12, lineHeight: 1.5 }}>
                Exportuj nebo importuj všechna data jako JSON soubor.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={exportToJson}
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: 'linear-gradient(135deg, #6c63ff, #4f9eff)', color: 'white',
                    touchAction: 'manipulation',
                  }}
                >
                  Exportovat JSON
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: 'transparent', color: '#6c63ff', border: '1.5px solid #6c63ff',
                    touchAction: 'manipulation',
                  }}
                >
                  Importovat JSON
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />

            {importError && (
              <p style={{ fontSize: 12, color: '#ef4444' }}>{importError}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── O aplikaci ── */}
      <div style={{ marginBottom: 16 }}>
        <p style={sectionLabel}>O aplikaci</p>
        <div style={card}>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: '#f0f0f0', fontWeight: 500 }}>Car Manager</span>
              <span style={{ fontSize: 12, color: '#5c6070' }}>v1.0.0</span>
            </div>
            <div style={{ fontSize: 12, color: '#9a9da8' }}>Správa vozu offline</div>
          </div>
        </div>
      </div>
    </div>
  )
}
