interface TokenResponse {
  access_token: string
  error?: string
  error_description?: string
}

interface OAuthError {
  type: string
  message?: string
}

interface TokenClientConfig {
  client_id: string
  scope: string
  callback: (response: TokenResponse) => void
  error_callback?: (error: OAuthError) => void
}

interface TokenClient {
  requestAccessToken(): void
}

interface Window {
  google?: {
    accounts: {
      oauth2: {
        initTokenClient(config: TokenClientConfig): TokenClient
        revoke(token: string, callback?: () => void): void
      }
    }
  }
}
