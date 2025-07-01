/**
 * Passkey Authentication React Hooks
 * Provides React hooks for passkey authentication state and methods
 */

import { useState, useEffect, useCallback } from 'react'
import { passkeyAuthService, PasskeyUser, PasskeySession } from '@/lib/auth/passkey-auth'

export interface UsePasskeyAuthReturn {
  // Authentication state
  isAuthenticated: boolean
  isLoading: boolean
  user: PasskeyUser | null
  session: PasskeySession | null
  error: string | null
  isSupported: boolean
  isPlatformAuthenticatorAvailable: boolean

  // Authentication methods
  registerPasskey: (username: string, displayName: string) => Promise<void>
  authenticateWithPasskey: (username?: string) => Promise<void>
  signOut: () => Promise<void>
  
  // Utility methods
  clearError: () => void
  checkSupport: () => Promise<void>
}

export interface UsePasskeyStatusReturn {
  isAuthenticated: boolean
  isSupported: boolean
  isPlatformAuthenticatorAvailable: boolean
  user: PasskeyUser | null
}

/**
 * Main passkey authentication hook
 */
export function usePasskeyAuth(): UsePasskeyAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<PasskeyUser | null>(null)
  const [session, setSession] = useState<PasskeySession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isPlatformAuthenticatorAvailable, setIsPlatformAuthenticatorAvailable] = useState(false)

  // Check authentication status on mount and periodically
  useEffect(() => {
    const checkAuthStatus = () => {
      const currentUser = passkeyAuthService.getCurrentUser()
      const currentSession = passkeyAuthService.getCurrentSession()
      const authenticated = passkeyAuthService.isAuthenticated()

      setUser(currentUser)
      setSession(currentSession)
      setIsAuthenticated(authenticated)
    }

    // Initial check
    checkAuthStatus()

    // Set up polling for auth state changes
    const interval = setInterval(checkAuthStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  // Check WebAuthn support on mount
  useEffect(() => {
    checkSupport()
  }, [])

  const checkSupport = useCallback(async () => {
    try {
      const supported = passkeyAuthService.isSupported()
      setIsSupported(supported)

      if (supported) {
        const platformAvailable = await passkeyAuthService.isPlatformAuthenticatorAvailable()
        setIsPlatformAuthenticatorAvailable(platformAvailable)
      }
    } catch (error) {
      console.error('Error checking passkey support:', error)
      setIsSupported(false)
      setIsPlatformAuthenticatorAvailable(false)
    }
  }, [])

  const registerPasskey = useCallback(async (username: string, displayName: string) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!isSupported) {
        throw new Error('Passkeys are not supported in this browser')
      }

      const newUser = await passkeyAuthService.registerPasskey(username, displayName)
      setUser(newUser)
      setIsAuthenticated(true)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register passkey'
      setError(errorMessage)
      console.error('Passkey registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const authenticateWithPasskey = useCallback(async (username?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!isSupported) {
        throw new Error('Passkeys are not supported in this browser')
      }

      const newSession = await passkeyAuthService.authenticateWithPasskey(username)
      setSession(newSession)
      setUser(newSession.user)
      setIsAuthenticated(true)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate with passkey'
      setError(errorMessage)
      console.error('Passkey authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      await passkeyAuthService.signOut()
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out'
      setError(errorMessage)
      console.error('Passkey sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isAuthenticated,
    isLoading,
    user,
    session,
    error,
    isSupported,
    isPlatformAuthenticatorAvailable,
    registerPasskey,
    authenticateWithPasskey,
    signOut,
    clearError,
    checkSupport,
  }
}

/**
 * Lightweight hook for checking passkey authentication status
 */
export function usePasskeyStatus(): UsePasskeyStatusReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isPlatformAuthenticatorAvailable, setIsPlatformAuthenticatorAvailable] = useState(false)
  const [user, setUser] = useState<PasskeyUser | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      // Check authentication
      const authenticated = passkeyAuthService.isAuthenticated()
      const currentUser = passkeyAuthService.getCurrentUser()
      
      setIsAuthenticated(authenticated)
      setUser(currentUser)

      // Check support
      const supported = passkeyAuthService.isSupported()
      setIsSupported(supported)

      if (supported) {
        try {
          const platformAvailable = await passkeyAuthService.isPlatformAuthenticatorAvailable()
          setIsPlatformAuthenticatorAvailable(platformAvailable)
        } catch (error) {
          console.error('Error checking platform authenticator:', error)
          setIsPlatformAuthenticatorAvailable(false)
        }
      }
    }

    checkStatus()

    // Set up polling
    const interval = setInterval(checkStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  return {
    isAuthenticated,
    isSupported,
    isPlatformAuthenticatorAvailable,
    user,
  }
}

/**
 * Hook for passkey session management
 */
export function usePasskeySession() {
  const [session, setSession] = useState<PasskeySession | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const checkSession = () => {
      const currentSession = passkeyAuthService.getCurrentSession()
      setSession(currentSession)

      if (currentSession) {
        const now = new Date()
        const expired = now > currentSession.expiresAt
        setIsExpired(expired)
      } else {
        setIsExpired(false)
      }
    }

    checkSession()
    const interval = setInterval(checkSession, 5000)
    return () => clearInterval(interval)
  }, [])

  const refreshSession = useCallback(async () => {
    // For passkey auth, we would need to re-authenticate
    // This is different from Privy where we can refresh tokens
    throw new Error('Session refresh requires re-authentication with passkey')
  }, [])

  return {
    session,
    isExpired,
    refreshSession,
  }
}

/**
 * Hook for passkey credential management
 */
export function usePasskeyCredentials() {
  const [credentials, setCredentials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listCredentials = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // This would require implementation of credential listing
      // For now, return empty array
      setCredentials([])

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list credentials'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteCredential = useCallback(async (credentialId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // This would require implementation of credential deletion
      console.log('Deleting credential:', credentialId)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete credential'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    credentials,
    isLoading,
    error,
    listCredentials,
    deleteCredential,
  }
} 