/**
 * Unified Authentication Hook
 * React hook for managing unified authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  unifiedAuthManager, 
  UnifiedUser, 
  UnifiedSession, 
  AuthMethod, 
  AuthPreferences,
  SigningResult 
} from '@/lib/auth/unified-auth'

export interface AuthCapabilities {
  privy: { available: boolean; configured: boolean }
  passkey: { available: boolean; supported: boolean; platformAuthenticator: boolean }
}

export interface UseUnifiedAuthReturn {
  // State
  isAuthenticated: boolean
  currentUser: UnifiedUser | null
  currentSession: UnifiedSession | null
  currentMethod: AuthMethod | null
  preferences: AuthPreferences
  capabilities: AuthCapabilities | null
  walletAddress: string | null

  // Loading states
  isLoading: boolean
  isAuthenticating: boolean
  isRegistering: boolean
  isSigning: boolean
  isSwitching: boolean

  // Error state
  error: string | null

  // Methods
  authenticate: (options?: AuthenticateOptions) => Promise<void>
  register: (method: AuthMethod, options?: RegisterOptions) => Promise<void>
  signMessage: (message: string) => Promise<SigningResult>
  signTypedData: (typedData: any) => Promise<SigningResult>
  switchAuthMethod: (method: AuthMethod) => Promise<void>
  setPreferences: (preferences: Partial<AuthPreferences>) => Promise<void>
  signOut: (clearPreferences?: boolean) => Promise<void>
  clearError: () => void
  refreshCapabilities: () => Promise<void>
}

export interface AuthenticateOptions {
  method?: AuthMethod
  email?: string
  username?: string
  displayName?: string
}

export interface RegisterOptions {
  email?: string
  username?: string
  displayName?: string
}

export function useUnifiedAuth(): UseUnifiedAuthReturn {
  // Core state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<UnifiedUser | null>(null)
  const [currentSession, setCurrentSession] = useState<UnifiedSession | null>(null)
  const [currentMethod, setCurrentMethod] = useState<AuthMethod | null>(null)
  const [preferences, setPreferencesState] = useState<AuthPreferences>({
    preferredMethod: 'privy',
    allowFallback: true,
    rememberChoice: true,
  })
  const [capabilities, setCapabilities] = useState<AuthCapabilities | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  // Error state
  const [error, setError] = useState<string | null>(null)

  /**
   * Update state from auth manager
   */
  const updateState = useCallback(() => {
    const authenticated = unifiedAuthManager.isAuthenticated()
    const user = unifiedAuthManager.getCurrentUser()
    const session = unifiedAuthManager.getCurrentSession()
    const method = unifiedAuthManager.getCurrentMethod()
    const prefs = unifiedAuthManager.getPreferences()
    const address = unifiedAuthManager.getWalletAddress()

    setIsAuthenticated(authenticated)
    setCurrentUser(user)
    setCurrentSession(session)
    setCurrentMethod(method)
    setPreferencesState(prefs)
    setWalletAddress(address)
  }, [])

  /**
   * Load authentication capabilities
   */
  const refreshCapabilities = useCallback(async () => {
    try {
      const caps = await unifiedAuthManager.getAuthCapabilities()
      setCapabilities(caps)
    } catch (err) {
      console.error('Failed to load auth capabilities:', err)
      setError('Failed to load authentication capabilities')
    }
  }, [])

  /**
   * Initialize hook
   */
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      try {
        await refreshCapabilities()
        updateState()
      } catch (err) {
        console.error('Failed to initialize unified auth:', err)
        setError('Failed to initialize authentication')
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [refreshCapabilities, updateState])

  /**
   * Set up polling for state changes
   */
  useEffect(() => {
    const interval = setInterval(updateState, 2000)
    return () => clearInterval(interval)
  }, [updateState])

  /**
   * Authenticate with specified options
   */
  const authenticate = useCallback(async (options?: AuthenticateOptions) => {
    setIsAuthenticating(true)
    setError(null)
    
    try {
      await unifiedAuthManager.authenticate(options)
      updateState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsAuthenticating(false)
    }
  }, [updateState])

  /**
   * Register with specified method
   */
  const register = useCallback(async (method: AuthMethod, options?: RegisterOptions) => {
    setIsRegistering(true)
    setError(null)
    
    try {
      await unifiedAuthManager.register(method, options)
      updateState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsRegistering(false)
    }
  }, [updateState])

  /**
   * Sign message
   */
  const signMessage = useCallback(async (message: string): Promise<SigningResult> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated')
    }

    setIsSigning(true)
    setError(null)
    
    try {
      const result = await unifiedAuthManager.signMessage(message)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Message signing failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsSigning(false)
    }
  }, [isAuthenticated])

  /**
   * Sign typed data
   */
  const signTypedData = useCallback(async (typedData: any): Promise<SigningResult> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated')
    }

    setIsSigning(true)
    setError(null)
    
    try {
      const result = await unifiedAuthManager.signTypedData(typedData)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Typed data signing failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsSigning(false)
    }
  }, [isAuthenticated])

  /**
   * Switch authentication method
   */
  const switchAuthMethod = useCallback(async (method: AuthMethod) => {
    setIsSwitching(true)
    setError(null)
    
    try {
      await unifiedAuthManager.switchAuthMethod(method)
      updateState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch authentication method'
      setError(errorMessage)
      throw err
    } finally {
      setIsSwitching(false)
    }
  }, [updateState])

  /**
   * Update preferences
   */
  const setPreferences = useCallback(async (newPreferences: Partial<AuthPreferences>) => {
    setError(null)
    
    try {
      await unifiedAuthManager.setPreferences(newPreferences)
      setPreferencesState(unifiedAuthManager.getPreferences())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences'
      setError(errorMessage)
      throw err
    }
  }, [])

  /**
   * Sign out
   */
  const signOut = useCallback(async (clearPreferences: boolean = false) => {
    setError(null)
    
    try {
      await unifiedAuthManager.signOut(clearPreferences)
      updateState()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed'
      setError(errorMessage)
      throw err
    }
  }, [updateState])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    isAuthenticated,
    currentUser,
    currentSession,
    currentMethod,
    preferences,
    capabilities,
    walletAddress,

    // Loading states
    isLoading,
    isAuthenticating,
    isRegistering,
    isSigning,
    isSwitching,

    // Error state
    error,

    // Methods
    authenticate,
    register,
    signMessage,
    signTypedData,
    switchAuthMethod,
    setPreferences,
    signOut,
    clearError,
    refreshCapabilities,
  }
}

/**
 * Hook for checking authentication status only
 * Lighter weight alternative when full auth functionality isn't needed
 */
export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentMethod, setCurrentMethod] = useState<AuthMethod | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    const updateStatus = () => {
      setIsAuthenticated(unifiedAuthManager.isAuthenticated())
      setCurrentMethod(unifiedAuthManager.getCurrentMethod())
      setWalletAddress(unifiedAuthManager.getWalletAddress())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  return {
    isAuthenticated,
    currentMethod,
    walletAddress,
  }
}

/**
 * Hook for authentication capabilities
 * Useful for conditional rendering based on what's available
 */
export function useAuthCapabilities() {
  const [capabilities, setCapabilities] = useState<AuthCapabilities | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const caps = await unifiedAuthManager.getAuthCapabilities()
      setCapabilities(caps)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load capabilities')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    capabilities,
    isLoading,
    error,
    refresh,
  }
} 