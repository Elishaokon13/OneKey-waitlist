/**
 * Privy Authentication Module
 * Handles user authentication, wallet creation, and session management using Privy
 */

import { PrivyInterface, User, ConnectedWallet } from '@privy-io/react-auth'
import { createUserSession, revokeUserSession } from '@/lib/middleware/auth'
import { databaseService } from '@/lib/database'

export interface AuthUser {
  id: string
  walletAddress: string
  privyUserId: string
  email?: string
  phone?: string
  connectedAccounts: string[]
  createdAt: Date
}

export interface AuthSession {
  sessionToken: string
  expiresAt: Date
  user: AuthUser
}

export interface SigningResult {
  signature: string
  message: string
  address: string
}

export class PrivyAuthService {
  private static instance: PrivyAuthService
  private privy: PrivyInterface | null = null
  private currentUser: AuthUser | null = null
  private currentSession: AuthSession | null = null

  private constructor() {}

  static getInstance(): PrivyAuthService {
    if (!PrivyAuthService.instance) {
      PrivyAuthService.instance = new PrivyAuthService()
    }
    return PrivyAuthService.instance
  }

  /**
   * Initialize Privy authentication service
   */
  initialize(privyInstance: PrivyInterface): void {
    this.privy = privyInstance
    
    // Set up event listeners for authentication state changes
    this.setupEventListeners()
  }

  /**
   * Set up event listeners for Privy authentication events
   */
  private setupEventListeners(): void {
    if (!this.privy) return

    // Listen for login events
    this.privy.onAuthStateChange(async (user: User | null) => {
      try {
        if (user) {
          await this.handleUserLogin(user)
        } else {
          await this.handleUserLogout()
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        // Don't re-throw to prevent uncaught promise rejection
      }
    })
  }

  /**
   * Handle user login event
   */
  private async handleUserLogin(privyUser: User): Promise<void> {
    try {
      // Get the primary wallet address
      const wallet = this.getPrimaryWallet(privyUser)
      if (!wallet) {
        throw new Error('No wallet found for user')
      }

      // Create auth user object
      const authUser: AuthUser = {
        id: privyUser.id,
        walletAddress: wallet.address,
        privyUserId: privyUser.id,
        email: privyUser.email?.address,
        phone: privyUser.phone?.number,
        connectedAccounts: this.getConnectedAccounts(privyUser),
        createdAt: new Date(privyUser.createdAt),
      }

      // Create session in database
      const sessionData = await createUserSession(
        wallet.address,
        privyUser.id
      )

      // Create auth session
      const authSession: AuthSession = {
        sessionToken: sessionData.sessionToken,
        expiresAt: sessionData.expiresAt,
        user: authUser,
      }

      this.currentUser = authUser
      this.currentSession = authSession

      // Create audit log
      await databaseService.createAuditLog({
        userId: authUser.id,
        action: 'user_login',
        metadata: {
          loginMethod: this.getLoginMethod(privyUser),
          walletAddress: wallet.address,
        },
      })

      console.log('User authenticated successfully:', authUser.walletAddress)
    } catch (error) {
      console.error('Failed to handle user login:', error)
      throw error
    }
  }

  /**
   * Handle user logout event
   */
  private async handleUserLogout(): Promise<void> {
    try {
      if (this.currentSession) {
        // Revoke session in database
        await revokeUserSession(this.currentSession.sessionToken)

        // Create audit log
        if (this.currentUser) {
          await databaseService.createAuditLog({
            userId: this.currentUser.id,
            action: 'user_logout',
            metadata: {
              sessionToken: this.currentSession.sessionToken,
            },
          })
        }
      }

      this.currentUser = null
      this.currentSession = null

      console.log('User logged out successfully')
    } catch (error) {
      console.error('Failed to handle user logout:', error)
    }
  }

  /**
   * Get primary wallet from Privy user
   */
  private getPrimaryWallet(user: User): ConnectedWallet | null {
    if (!user.linkedAccounts) return null

    // Find the first wallet account
    const walletAccount = user.linkedAccounts.find(
      account => account.type === 'wallet'
    ) as ConnectedWallet

    return walletAccount || null
  }

  /**
   * Get connected accounts list
   */
  private getConnectedAccounts(user: User): string[] {
    if (!user.linkedAccounts) return []

    return user.linkedAccounts.map(account => account.type)
  }

  /**
   * Get login method used
   */
  private getLoginMethod(user: User): string {
    if (user.email) return 'email'
    if (user.phone) return 'phone'
    if (user.google) return 'google'
    if (user.twitter) return 'twitter'
    if (user.discord) return 'discord'
    if (user.github) return 'github'
    if (user.linkedin) return 'linkedin'
    if (user.spotify) return 'spotify'
    if (user.instagram) return 'instagram'
    if (user.tiktok) return 'tiktok'
    return 'wallet'
  }

  /**
   * Login user with email
   */
  async loginWithEmail(email: string): Promise<void> {
    if (!this.privy) {
      throw new Error('Privy not initialized')
    }

    try {
      await this.privy.login()
    } catch (error) {
      console.error('Email login failed:', error)
      throw new Error('Failed to login with email')
    }
  }

  /**
   * Login user with phone
   */
  async loginWithPhone(phone: string): Promise<void> {
    if (!this.privy) {
      throw new Error('Privy not initialized')
    }

    try {
      await this.privy.login()
    } catch (error) {
      console.error('Phone login failed:', error)
      throw new Error('Failed to login with phone')
    }
  }

  /**
   * Login user with social provider
   */
  async loginWithSocial(provider: 'google' | 'twitter' | 'discord' | 'github'): Promise<void> {
    if (!this.privy) {
      throw new Error('Privy not initialized')
    }

    try {
      await this.privy.login()
    } catch (error) {
      console.error(`${provider} login failed:`, error)
      throw new Error(`Failed to login with ${provider}`)
    }
  }

  /**
   * Login user with wallet
   */
  async loginWithWallet(): Promise<void> {
    if (!this.privy) {
      throw new Error('Privy not initialized')
    }

    try {
      await this.privy.login()
    } catch (error) {
      console.error('Wallet login failed:', error)
      throw new Error('Failed to login with wallet')
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    if (!this.privy) {
      throw new Error('Privy not initialized')
    }

    try {
      await this.privy.logout()
    } catch (error) {
      console.error('Logout failed:', error)
      throw new Error('Failed to logout')
    }
  }

  /**
   * Sign message with user's wallet
   */
  async signMessage(message: string): Promise<SigningResult> {
    if (!this.privy || !this.currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      // Get the user's wallet
      const wallet = await this.privy.getActiveWallet()
      if (!wallet) {
        throw new Error('No active wallet found')
      }

      // Sign the message
      const signature = await wallet.sign(message)

      const result: SigningResult = {
        signature,
        message,
        address: wallet.address,
      }

      // Create audit log
      await databaseService.createAuditLog({
        userId: this.currentUser.id,
        action: 'message_signed',
        metadata: {
          messageHash: this.hashMessage(message),
          walletAddress: wallet.address,
        },
      })

      return result
    } catch (error) {
      console.error('Message signing failed:', error)
      throw new Error('Failed to sign message')
    }
  }

  /**
   * Sign typed data with user's wallet
   */
  async signTypedData(typedData: any): Promise<SigningResult> {
    if (!this.privy || !this.currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      // Get the user's wallet
      const wallet = await this.privy.getActiveWallet()
      if (!wallet) {
        throw new Error('No active wallet found')
      }

      // Sign the typed data
      const signature = await wallet.signTypedData(typedData)

      const result: SigningResult = {
        signature,
        message: JSON.stringify(typedData),
        address: wallet.address,
      }

      // Create audit log
      await databaseService.createAuditLog({
        userId: this.currentUser.id,
        action: 'typed_data_signed',
        metadata: {
          dataHash: this.hashMessage(JSON.stringify(typedData)),
          walletAddress: wallet.address,
        },
      })

      return result
    } catch (error) {
      console.error('Typed data signing failed:', error)
      throw new Error('Failed to sign typed data')
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  /**
   * Get current session
   */
  getCurrentSession(): AuthSession | null {
    return this.currentSession
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentSession !== null
  }

  /**
   * Get user's wallet address
   */
  getWalletAddress(): string | null {
    return this.currentUser?.walletAddress || null
  }

  /**
   * Get session token for API calls
   */
  getSessionToken(): string | null {
    return this.currentSession?.sessionToken || null
  }

  /**
   * Refresh session if needed
   */
  async refreshSession(): Promise<void> {
    if (!this.currentUser || !this.currentSession) {
      throw new Error('No active session to refresh')
    }

    // Check if session is close to expiring (within 1 hour)
    const oneHour = 60 * 60 * 1000
    const timeUntilExpiry = this.currentSession.expiresAt.getTime() - Date.now()

    if (timeUntilExpiry < oneHour) {
      try {
        // Create new session
        const sessionData = await createUserSession(
          this.currentUser.walletAddress,
          this.currentUser.privyUserId
        )

        // Update current session
        this.currentSession.sessionToken = sessionData.sessionToken
        this.currentSession.expiresAt = sessionData.expiresAt

        // Create audit log
        await databaseService.createAuditLog({
          userId: this.currentUser.id,
          action: 'session_refreshed',
          metadata: {
            newSessionToken: sessionData.sessionToken,
          },
        })

        console.log('Session refreshed successfully')
      } catch (error) {
        console.error('Failed to refresh session:', error)
        throw error
      }
    }
  }

  /**
   * Hash message for audit logging
   */
  private hashMessage(message: string): string {
    // Simple hash for audit purposes (in production, use crypto.subtle)
    let hash = 0
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(16)
  }

  /**
   * Get authentication status
   */
  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.currentUser,
      session: this.currentSession ? {
        expiresAt: this.currentSession.expiresAt,
        isExpired: this.currentSession.expiresAt < new Date(),
      } : null,
      privy: {
        initialized: this.privy !== null,
      },
    }
  }
}

// Export singleton instance
export const privyAuthService = PrivyAuthService.getInstance() 