import { useState, useEffect } from 'react'
import { buildPayload, validatePayload, applyPayload } from '../utils/exportImport'

const BACKUP_FILENAME = 'car-manager-backup.json'
const LAST_BACKUP_KEY = 'cm_last_backup'
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'

// Stored in module scope — lives for the page session, never persisted to localStorage
let _accessToken: string | null = null

interface DriveState {
  isSignedIn: boolean
  userEmail: string | null
  lastBackupAt: string | null
  isLoading: boolean
  error: string | null
}

async function fetchUserEmail(token: string): Promise<string | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json() as { email?: string }
    return data.email ?? null
  } catch {
    return null
  }
}

async function findBackupFile(token: string): Promise<string | null> {
  const params = new URLSearchParams({ spaces: 'appDataFolder', q: `name='${BACKUP_FILENAME}'` })
  const res = await fetch(`${DRIVE_FILES_URL}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`)
  const data = await res.json() as { files?: { id: string }[] }
  return data.files?.[0]?.id ?? null
}

function buildMultipartBody(metadata: object, content: string, boundary: string): string {
  return [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    content,
    `--${boundary}--`,
  ].join('\r\n')
}

function waitForGoogle(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google) { resolve(); return }
    const interval = setInterval(() => {
      if (window.google) { clearInterval(interval); resolve() }
    }, 100)
    setTimeout(() => {
      clearInterval(interval)
      reject(new Error('Google přihlášení se nepodařilo načíst — zkus obnovit stránku'))
    }, 5000)
  })
}

export function useDriveBackup() {
  const [state, setState] = useState<DriveState>({
    isSignedIn: false,
    userEmail: null,
    lastBackupAt: localStorage.getItem(LAST_BACKUP_KEY),
    isLoading: false,
    error: null,
  })

  // Restore signed-in state if token survived a remount
  useEffect(() => {
    if (_accessToken) {
      fetchUserEmail(_accessToken).then(email => {
        setState(s => ({ ...s, isSignedIn: true, userEmail: email }))
      })
    }
  }, [])

  function patch(updates: Partial<DriveState>) {
    setState(s => ({ ...s, ...updates }))
  }

  async function signIn() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      || '913649498603-p75h2rl2no2hn2erat30oi8o8msacfmo.apps.googleusercontent.com'
    patch({ error: null })
    try {
      await waitForGoogle()
    } catch (e) {
      patch({ error: e instanceof Error ? e.message : 'Google se nepodařilo načíst' })
      return
    }
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.appdata',
      error_callback: (err) => {
        patch({ error: `Přihlášení selhalo: ${err.type}` })
      },
      callback: async (response) => {
        if (response.error || !response.access_token) {
          patch({ error: `Přihlášení selhalo: ${response.error ?? 'unknown'}` })
          return
        }
        _accessToken = response.access_token
        const email = await fetchUserEmail(_accessToken)
        patch({ isSignedIn: true, userEmail: email, error: null })
      },
    })
    client.requestAccessToken()
  }

  function signOut() {
    if (_accessToken && window.google) {
      window.google.accounts.oauth2.revoke(_accessToken)
    }
    _accessToken = null
    patch({ isSignedIn: false, userEmail: null, error: null })
  }

  async function backup() {
    if (!_accessToken) { patch({ error: 'Nejsi přihlášen' }); return }
    patch({ isLoading: true, error: null })
    try {
      const content = JSON.stringify(buildPayload())
      const boundary = 'cm_backup_boundary_001'
      const existingId = await findBackupFile(_accessToken)

      if (existingId) {
        const body = buildMultipartBody({ name: BACKUP_FILENAME, mimeType: 'application/json' }, content, boundary)
        const res = await fetch(`${DRIVE_UPLOAD_URL}/${existingId}?uploadType=multipart`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${_accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body,
        })
        if (!res.ok) throw new Error(`${res.status}`)
      } else {
        const body = buildMultipartBody(
          { name: BACKUP_FILENAME, mimeType: 'application/json', parents: ['appDataFolder'] },
          content,
          boundary,
        )
        const res = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${_accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body,
        })
        if (!res.ok) throw new Error(`${res.status}`)
      }

      const now = new Date().toISOString()
      localStorage.setItem(LAST_BACKUP_KEY, now)
      patch({ lastBackupAt: now, isLoading: false })
    } catch {
      patch({ isLoading: false, error: 'Záloha selhala — zkontroluj připojení' })
    }
  }

  async function restore() {
    if (!_accessToken) { patch({ error: 'Nejsi přihlášen' }); return }
    patch({ isLoading: true, error: null })
    try {
      const fileId = await findBackupFile(_accessToken)
      if (!fileId) {
        patch({ isLoading: false, error: 'Žádná záloha nenalezena v Google Drive' })
        return
      }

      const res = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${_accessToken}` },
      })
      if (!res.ok) throw new Error(`${res.status}`)

      const data: unknown = await res.json()
      if (!validatePayload(data)) {
        patch({ isLoading: false, error: 'Neplatný formát zálohy' })
        return
      }

      patch({ isLoading: false })
      if (!window.confirm('Tato akce přepíše všechna lokální data. Pokračovat?')) return

      applyPayload(data)
      window.location.reload()
    } catch {
      patch({ isLoading: false, error: 'Obnova selhala — zkontroluj připojení' })
    }
  }

  return { ...state, signIn, signOut, backup, restore }
}
