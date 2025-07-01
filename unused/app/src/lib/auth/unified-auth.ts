/**
 * Unified Authentication Manager
 * Provides consistent interface for both Privy and Passkey authentication
 */

import { privyAuthService } from './privy-auth'
import { passkeyAuthService } from './passkey-auth'
import { databaseService } from '@/lib/database'

export type AuthMethod = 'privy' | 'passkey'

export interface UnifiedUser {
  id: string
  authMethod: AuthMethod
  walletAddress: string | null
  displayName: string
  email?: string
  phone?: string
  username?: string
  createdAt: Date
  lastLoginAt: Date
}

export interface UnifiedSession {
  sessionToken: string
  expiresAt: Date
  authMethod: AuthMethod
  user: UnifiedUser
}

export interface AuthPreferences {
  preferredMethod: AuthMethod
  allowFallback: boolean
  rememberChoice: boolean
}

export interface SigningResult {
  signature: string
  message: string
  address: string
  method: AuthMethod
}

export class UnifiedAuthManager {
  private static instance: UnifiedAuthManager
  private currentMethod: AuthMethod | null = null
  private currentUser: UnifiedUser | null = null
  private currentSession: UnifiedSession | null = null
  private preferences: AuthPreferences = {
    preferredMethod: 'privy',
    allowFallback: true,
    rememberChoice: true,
  }

  private constructor() {
    this.loadPreferences()
    this.setupEventListeners()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): UnifiedAuthManager {
    if (!UnifiedAuthManager.instance) {
      UnifiedAuthManager.instance = new UnifiedAuthManager()
    }
    return UnifiedAuthManager.instance
  }

  /**
   * Check authentication capabilities
   */
  async getAuthCapabilities(): Promise<{
    privy: { available: boolean; configured: boolean }
    passkey: { available: boolean; supported: boolean; platformAuthenticator: boolean }
  }> {
    return {
      privy: {
        available: privyAuthService.isInitialized(),
        configured: !!process.env.NEXT_PUBLIC_PRIVY_APP_ID,
      },
      passkey: {
        available: true,
        supported: passkeyAuthService.isSupported(),
        platformAuthenticator: await passkeyAuthService.isPlatformAuthenticatorAvailable(),
      },
    }
  }

  /**
   * Get authentication preferences
   */
  getPreferences(): AuthPreferences {
    return { ...this.preferences }
  }

  /**
   * Update authentication preferences
   */
  async setPreferences(newPreferences: Partial<AuthPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences }
    
    if (this.preferences.rememberChoice) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('auth-preferences', JSON.stringify(this.preferences))
        }
      } catch (error) {
        console.error('Failed to save preferences to localStorage:', error)
      }
    }

    // Create audit log
    if (this.currentUser) {
      try {
        await databaseService.createAuditLog({
          userId: this.currentUser.id,
          action: 'auth_preferences_updated',
          details: newPreferences,
        })
      } catch (error) {
        console.error('Failed to create audit log for preferences update:', error)
        // Don't throw, this is not critical
      }
    }
  }

  /**
   * Authenticate with preferred method or fallback
   */
  async authenticate(options?: {
    method?: AuthMethod
    email?: string
    username?: string
    displayName?: string
  }): Promise<UnifiedSession> {
    try {
      const method = options?.method || this.preferences.preferredMethod
      const capabilities = await this.getAuthCapabilities()

      // Try preferred method first
      if (method === 'privy' && capabilities.privy.available) {
        return await this.authenticateWithPrivy(options?.email)
      } else if (method === 'passkey' && capabilities.passkey.supported) {
        return await this.authenticateWithPasskey(options?.username, options?.displayName)
      }

      // Fallback logic
      if (this.preferences.allowFallback) {
        if (method === 'privy' && capabilities.passkey.supported) {
          console.log('Falling back to passkey authentication')
          return await this.authenticateWithPasskey(options?.username, options?.displayName)
        } else if (method === 'passkey' && capabilities.privy.available) {
          console.log('Falling back to Privy authentication')
          return await this.authenticateWithPrivy(options?.email)
        }
      }

      throw new Error('No authentication method available')
    } catch (error) {
      console.error('Unified authentication failed:', error)
      throw new Error('Authentication failed')
    }
  }

  /**
   * Register with specified method
   */
  async register(method: AuthMethod, options?: {
    email?: string
    username?: string
    displayName?: string
  }): Promise<UnifiedSession> {
    try {
      if (method === 'privy') {
        return await this.authenticateWithPrivy(options?.email)
          } else if (method === 'passkey') {
      if (!options?.username || !options?.displayName) {
        const error = new Error('Username and display name required for passkey registration')
        console.error('Registration failed:', error)
        throw error
      }
      return await this.registerWithPasskey(options.username, options.displayName)
    }

      throw new Error('Invalid authentication method')
    } catch (error) {
      console.error('Registration failed:', error)
      throw new Error('Registration failed')
    }
  }

  /**
   * Sign message using current authentication method
   */
  async signMessage(message: string): Promise<SigningResult> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated')
    }

    try {
      let signature: string
      let address: string

      if (this.currentMethod === 'privy') {
        signature = await privyAuthService.signMessage(message)
        address = privyAuthService.getWalletAddress() || ''
      } else if (this.currentMethod === 'passkey') {
        try {
          signature = await passkeyAuthService.signMessage(message)
          address = passkeyAuthService.getWalletAddress() || ''
        } catch (error) {
          // Passkey signing not supported, provide helpful error
          throw new Error('Message signing requires wallet connection. Please connect an external wallet or switch to Privy authentication.')
        }
      } else {
        throw new Error('No authentication method active')
      }

      // Create audit log
      await databaseService.createAuditLog({
        userId: this.currentUser!.id,
        action: 'message_signed',
        details: {
          method: this.currentMethod,
          messageHash: this.hashMessage(message),
        },
      })

      return {
        signature,
        message,
        address,
        method: this.currentMethod!,
      }
    } catch (error) {
      console.error('Message signing failed:', error)
      throw error
    }
  }

  /**
   * Sign typed data using current authentication method
   */
  async signTypedData(typedData: any): Promise<SigningResult> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated')
    }

    try {
      let signature: string
      let address: string

      if (this.currentMethod === 'privy') {
        signature = await privyAuthService.signTypedData(typedData)
        address = privyAuthService.getWalletAddress() || ''
      } else if (this.currentMethod === 'passkey') {
        try {
          signature = await passkeyAuthService.signTypedData(typedData)
          address = passkeyAuthService.getWalletAddress() || ''
        } catch (error) {
          // Passkey signing not supported, provide helpful error
          throw new Error('Typed data signing requires wallet connection. Please connect an external wallet or switch to Privy authentication.')
        }
      } else {
        throw new Error('No authentication method active')
      }

      // Create audit log
      await databaseService.createAuditLog({
        userId: this.currentUser!.id,
        action: 'typed_data_signed',
        details: {
          method: this.currentMethod,
          dataHash: this.hashObject(typedData),
        },
      })

      return {
        signature,
        message: JSON.stringify(typedData),
        address,
        method: this.currentMethod!,
      }
    } catch (error) {
      console.error('Typed data signing failed:', error)
      throw error
    }
  }

  /**
   * Switch authentication method
   */
  async switchAuthMethod(newMethod: AuthMethod): Promise<UnifiedSession> {
    const capabilities = await this.getAuthCapabilities()
    
    if (newMethod === 'privy' && !capabilities.privy.available) {
      throw new Error('Privy authentication not available')
    }
    
    if (newMethod === 'passkey' && !capabilities.passkey.supported) {
      throw new Error('Passkey authentication not supported')
    }

    // Sign out current method
    if (this.isAuthenticated()) {
      await this.signOut(false) // Don't clear preferences
    }

    // Update preferences
    await this.setPreferences({ preferredMethod: newMethod })

    // Authenticate with new method
    return await this.authenticate({ method: newMethod })
  }

  /**
   * Sign out from current session
   */
  async signOut(clearPreferences: boolean = false): Promise<void> {
    try {
      // Sign out from current method
      if (this.currentMethod === 'privy') {
        await privyAuthService.logout()
      } else if (this.currentMethod === 'passkey') {
        await passkeyAuthService.signOut()
      }

      // Create audit log before clearing user
      if (this.currentUser) {
        await databaseService.createAuditLog({
          userId: this.currentUser.id,
          action: 'unified_logout',
          details: {
            method: this.currentMethod,
          },
        })
      }

      // Clear state
      this.currentMethod = null
      this.currentUser = null
      this.currentSession = null

      // Clear preferences if requested
      if (clearPreferences) {
        this.preferences = {
          preferredMethod: 'privy',
          allowFallback: true,
          rememberChoice: true,
        }
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('auth-preferences')
          }
        } catch (error) {
          console.error('Failed to remove preferences from localStorage:', error)
        }
      }

      console.log('Unified sign out successful')
    } catch (error) {
      console.error('Unified sign out failed:', error)
      throw new Error('Sign out failed')
    }
  }

  /**
   * Get current authentication state
   */
  isAuthenticated(): boolean {
    return !!(this.currentUser && this.currentSession && this.currentMethod)
  }

  /**
   * Get current user
   */
  getCurrentUser(): UnifiedUser | null {
    return this.currentUser
  }

  /**
   * Get current session
   */
  getCurrentSession(): UnifiedSession | null {
    return this.currentSession
  }

  /**
   * Get current authentication method
   */
  getCurrentMethod(): AuthMethod | null {
    return this.currentMethod
  }

  /**
   * Get wallet address from current authentication method
   */
  getWalletAddress(): string | null {
    if (this.currentMethod === 'privy') {
      return privyAuthService.getWalletAddress()
    } else if (this.currentMethod === 'passkey') {
      return passkeyAuthService.getWalletAddress()
    }
    return null
  }

  // Private methods

  private async authenticateWithPrivy(email?: string): Promise<UnifiedSession> {
    let session
    
    if (email) {
      session = await privyAuthService.loginWithEmail(email)
    } else {
      // Check if already authenticated
      if (privyAuthService.isAuthenticated()) {
        session = privyAuthService.getCurrentSession()
      } else {
        // Trigger general login
        session = await privyAuthService.loginWithWallet()
      }
    }

    if (!session) {
      throw new Error('Privy authentication failed')
    }

    const user = this.convertPrivyUser(session.user)
    const unifiedSession: UnifiedSession = {
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt,
      authMethod: 'privy',
      user,
    }

    this.currentMethod = 'privy'
    this.currentUser = user
    this.currentSession = unifiedSession

    return unifiedSession
  }

  private async authenticateWithPasskey(username?: string, displayName?: string): Promise<UnifiedSession> {
    const session = await passkeyAuthService.authenticateWithPasskey(username)

    if (!session) {
      throw new Error('Passkey authentication failed')
    }

    const user = this.convertPasskeyUser(session.user)
    const unifiedSession: UnifiedSession = {
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt,
      authMethod: 'passkey',
      user,
    }

    this.currentMethod = 'passkey'
    this.currentUser = user
    this.currentSession = unifiedSession

    return unifiedSession
  }

  private async registerWithPasskey(username: string, displayName: string): Promise<UnifiedSession> {
    const user = await passkeyAuthService.registerPasskey(username, displayName)

    if (!user) {
      throw new Error('Passkey registration failed')
    }

    // Create session after registration
    const session = await passkeyAuthService.authenticateWithPasskey(username)
    
    if (!session) {
      throw new Error('Failed to create session after passkey registration')
    }

    const unifiedUser = this.convertPasskeyUser(user)
    const unifiedSession: UnifiedSession = {
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt,
      authMethod: 'passkey',
      user: unifiedUser,
    }

    this.currentMethod = 'passkey'
    this.currentUser = unifiedUser
    this.currentSession = unifiedSession

    return unifiedSession
  }

  private convertPrivyUser(privyUser: any): UnifiedUser {
    return {
      id: privyUser.privyId || privyUser.id,
      authMethod: 'privy',
      walletAddress: privyUser.walletAddress,
      displayName: privyUser.email?.address || privyUser.phone?.number || 'Privy User',
      email: privyUser.email?.address,
      phone: privyUser.phone?.number,
      createdAt: privyUser.createdAt || new Date(),
      lastLoginAt: new Date(),
    }
  }

  private convertPasskeyUser(passkeyUser: any): UnifiedUser {
    return {
      id: passkeyUser.id,
      authMethod: 'passkey',
      walletAddress: passkeyAuthService.getWalletAddress(),
      displayName: passkeyUser.displayName,
      username: passkeyUser.username,
      createdAt: passkeyUser.createdAt || new Date(),
      lastLoginAt: new Date(),
    }
  }

  private loadPreferences(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('auth-preferences')
        if (stored) {
          this.preferences = { ...this.preferences, ...JSON.parse(stored) }
        }
      }
    } catch (error) {
      console.error('Failed to load auth preferences:', error)
    }
  }

  private setupEventListeners(): void {
    // Listen for changes in underlying auth services
    const checkAuthStatus = () => {
      const privyAuth = privyAuthService.isAuthenticated()
      const passkeyAuth = passkeyAuthService.isAuthenticated()

      if (!privyAuth && !passkeyAuth && this.isAuthenticated()) {
        // User was signed out externally
        this.currentMethod = null
        this.currentUser = null
        this.currentSession = null
      }
    }

    // Poll for auth state changes
    setInterval(checkAuthStatus, 2000)
  }

  private hashMessage(message: string): string {
    // Simple hash for audit logging (not cryptographically secure)
    let hash = 0
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(16)
  }

  private hashObject(obj: any): string {
    return this.hashMessage(JSON.stringify(obj))
  }
}

// Export singleton instance
export const unifiedAuthManager = UnifiedAuthManager.getInstance() 