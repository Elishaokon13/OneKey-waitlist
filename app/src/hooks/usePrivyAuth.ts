/**
 * Privy Authentication React Hooks
 * Provides React hooks for authentication state and methods
 */

import { useState, useEffect, useCallback } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { privyAuthService, AuthUser, AuthSession, SigningResult } from '@/lib/auth/privy-auth'

export interface UsePrivyAuthReturn {
  // Authentication state
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  session: AuthSession | null
  error: string | null

  // Authentication methods
  loginWithEmail: (email: string) => Promise<void>
  loginWithPhone: (phone: string) => Promise<void>
  loginWithSocial: (provider: 'google' | 'twitter' | 'discord' | 'github') => Promise<void>
  loginWithWallet: () => Promise<void>
  logout: () => Promise<void>

  // Signing methods
  signMessage: (message: string) => Promise<SigningResult>
  signTypedData: (typedData: any) => Promise<SigningResult>

  // Session management
  refreshSession: () => Promise<void>
  getSessionToken: () => string | null
  getWalletAddress: () => string | null

  // Utility methods
  clearError: () => void
}

/**
 * Main Privy authentication hook
 */
export function usePrivyAuth(): UsePrivyAuthReturn {
  const privy = usePrivy()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null as AuthUser | null,
    session: null as AuthSession | null,
  })

  // Initialize Privy auth service
  useEffect(() => {
    if (privy && !privyAuthService.getAuthStatus().privy.initialized) {
      privyAuthService.initialize(privy)
    }
  }, [privy])

  // Update auth state when Privy state changes
  useEffect(() => {
    const updateAuthState = () => {
      const status = privyAuthService.getAuthStatus()
      setAuthState({
        isAuthenticated: status.isAuthenticated,
        user: status.user,
        session: privyAuthService.getCurrentSession(),
      })
    }

    // Initial state update
    updateAuthState()

    // Set up polling for auth state changes (since Privy handles state internally)
    const interval = setInterval(updateAuthState, 1000)

    return () => clearInterval(interval)
  }, [])

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Login with email
  const loginWithEmail = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await privyAuthService.loginWithEmail(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login with phone
  const loginWithPhone = useCallback(async (phone: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await privyAuthService.loginWithPhone(phone)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Phone login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login with social provider
  const loginWithSocial = useCallback(async (provider: 'google' | 'twitter' | 'discord' | 'github') => {
    setIsLoading(true)
    setError(null)
    try {
      await privyAuthService.loginWithSocial(provider)
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} login failed`)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login with wallet
  const loginWithWallet = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await privyAuthService.loginWithWallet()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wallet login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await privyAuthService.logout()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<SigningResult> => {
    setError(null)
    try {
      return await privyAuthService.signMessage(message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message signing failed')
      throw err
    }
  }, [])

  // Sign typed data
  const signTypedData = useCallback(async (typedData: any): Promise<SigningResult> => {
    setError(null)
    try {
      return await privyAuthService.signTypedData(typedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Typed data signing failed')
      throw err
    }
  }, [])

  // Refresh session
  const refreshSession = useCallback(async () => {
    setError(null)
    try {
      await privyAuthService.refreshSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session refresh failed')
      throw err
    }
  }, [])

  // Get session token
  const getSessionToken = useCallback(() => {
    return privyAuthService.getSessionToken()
  }, [])

  // Get wallet address
  const getWalletAddress = useCallback(() => {
    return privyAuthService.getWalletAddress()
  }, [])

  return {
    // State
    isAuthenticated: authState.isAuthenticated,
    isLoading,
    user: authState.user,
    session: authState.session,
    error,

    // Authentication methods
    loginWithEmail,
    loginWithPhone,
    loginWithSocial,
    loginWithWallet,
    logout,

    // Signing methods
    signMessage,
    signTypedData,

    // Session management
    refreshSession,
    getSessionToken,
    getWalletAddress,

    // Utility methods
    clearError,
  }
}

/**
 * Hook for authentication status only (lightweight)
 */
export function useAuthStatus() {
  const [status, setStatus] = useState(privyAuthService.getAuthStatus())

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(privyAuthService.getAuthStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return status
}

/**
 * Hook for session management
 */
export function useSession() {
  const [session, setSession] = useState(privyAuthService.getCurrentSession())

  useEffect(() => {
    const interval = setInterval(() => {
      setSession(privyAuthService.getCurrentSession())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const refreshSession = useCallback(async () => {
    await privyAuthService.refreshSession()
    setSession(privyAuthService.getCurrentSession())
  }, [])

  const getSessionToken = useCallback(() => {
    return session?.sessionToken || null
  }, [session])

  const isSessionExpired = useCallback(() => {
    return session ? session.expiresAt < new Date() : true
  }, [session])

  return {
    session,
    refreshSession,
    getSessionToken,
    isSessionExpired,
  }
}

/**
 * Hook for wallet operations
 */
export function useWallet() {
  const { user, signMessage, signTypedData } = usePrivyAuth()

  const walletAddress = user?.walletAddress || null

  const signMessageWithWallet = useCallback(async (message: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }
    return await signMessage(message)
  }, [user, signMessage])

  const signTypedDataWithWallet = useCallback(async (typedData: any) => {
    if (!user) {
      throw new Error('User not authenticated')
    }
    return await signTypedData(typedData)
  }, [user, signTypedData])

  return {
    walletAddress,
    signMessage: signMessageWithWallet,
    signTypedData: signTypedDataWithWallet,
    hasWallet: !!walletAddress,
  }
} 