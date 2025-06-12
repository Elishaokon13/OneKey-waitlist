/**
 * Passkey Authentication Module
 * Handles WebAuthn-based passkey authentication as fallback for Privy
 */

import { databaseService } from '@/lib/database'
import { createUserSession, revokeUserSession } from '@/lib/middleware/auth'

export interface PasskeyCredential {
  id: string
  publicKey: ArrayBuffer
  algorithm: number
  counter: number
  deviceType: 'platform' | 'cross-platform'
  createdAt: Date
  lastUsed: Date
}

export interface PasskeyUser {
  id: string
  username: string
  displayName: string
  credentials: PasskeyCredential[]
  createdAt: Date
}

export interface PasskeySession {
  sessionToken: string
  expiresAt: Date
  user: PasskeyUser
}

export interface RegistrationOptions {
  challenge: ArrayBuffer
  rp: {
    name: string
    id: string
  }
  user: {
    id: ArrayBuffer
    name: string
    displayName: string
  }
  pubKeyCredParams: PublicKeyCredentialParameters[]
  authenticatorSelection: AuthenticatorSelectionCriteria
  timeout: number
  attestation: AttestationConveyancePreference
}

export interface AuthenticationOptions {
  challenge: ArrayBuffer
  timeout: number
  rpId: string
  allowCredentials?: PublicKeyCredentialDescriptor[]
  userVerification: UserVerificationRequirement
}

export class PasskeyAuthService {
  private static instance: PasskeyAuthService
  private currentUser: PasskeyUser | null = null
  private currentSession: PasskeySession | null = null

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): PasskeyAuthService {
    if (!PasskeyAuthService.instance) {
      PasskeyAuthService.instance = new PasskeyAuthService()
    }
    return PasskeyAuthService.instance
  }

  /**
   * Check if WebAuthn is supported in the current browser
   */
  isSupported(): boolean {
    return !!(
      window.PublicKeyCredential &&
      window.navigator.credentials &&
      window.navigator.credentials.create &&
      window.navigator.credentials.get
    )
  }

  /**
   * Check if platform authenticator is available (Face ID, Touch ID, Windows Hello)
   */
  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    } catch (error) {
      console.error('Error checking platform authenticator:', error)
      return false
    }
  }

  /**
   * Generate registration options for new passkey
   */
  async generateRegistrationOptions(
    username: string,
    displayName: string,
    userId?: string
  ): Promise<RegistrationOptions> {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const userIdBuffer = userId 
      ? new TextEncoder().encode(userId)
      : crypto.getRandomValues(new Uint8Array(16))

    const options: RegistrationOptions = {
      challenge,
      rp: {
        name: 'Blink Protocol KYC',
        id: window.location.hostname,
      },
      user: {
        id: userIdBuffer,
        name: username,
        displayName: displayName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'direct',
    }

    return options
  }

  /**
   * Register a new passkey
   */
  async registerPasskey(
    username: string,
    displayName: string,
    userId?: string
  ): Promise<PasskeyUser> {
    try {
      if (!this.isSupported()) {
        throw new Error('WebAuthn is not supported in this browser')
      }

      const options = await this.generateRegistrationOptions(username, displayName, userId)
      
      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: options,
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('Failed to create credential')
      }

      const response = credential.response as AuthenticatorAttestationResponse
      const publicKey = response.getPublicKey()
      
      if (!publicKey) {
        throw new Error('Failed to get public key from credential')
      }

      // Create user record
      const user: PasskeyUser = {
        id: Array.from(new Uint8Array(options.user.id)).map(b => b.toString(16).padStart(2, '0')).join(''),
        username,
        displayName,
        credentials: [{
          id: credential.id,
          publicKey,
          algorithm: this.getAlgorithmFromCredential(response),
          counter: response.getAuthenticatorData ? this.getCounterFromAuthenticatorData(response.getAuthenticatorData()) : 0,
          deviceType: 'platform',
          createdAt: new Date(),
          lastUsed: new Date(),
        }],
        createdAt: new Date(),
      }

      // Store user in database (without PII, just credential metadata)
      await this.storeUserCredentials(user)

      // Create audit log
      await databaseService.createAuditLog({
        userId: user.id,
        action: 'passkey_registration',
        details: {
          credentialId: credential.id,
          deviceType: 'platform',
        },
      })

      console.log('Passkey registered successfully for user:', username)
      return user

    } catch (error) {
      console.error('Passkey registration failed:', error)
      throw new Error('Failed to register passkey')
    }
  }

  /**
   * Generate authentication options for existing passkey
   */
  async generateAuthenticationOptions(username?: string): Promise<AuthenticationOptions> {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    
    let allowCredentials: PublicKeyCredentialDescriptor[] | undefined

    if (username) {
      // Get user's credentials from database
      const userCredentials = await this.getUserCredentials(username)
      if (userCredentials.length > 0) {
        allowCredentials = userCredentials.map(cred => ({
          id: new TextEncoder().encode(cred.id),
          type: 'public-key' as const,
          transports: ['internal'] as AuthenticatorTransport[],
        }))
      }
    }

    const options: AuthenticationOptions = {
      challenge,
      timeout: 60000,
      rpId: window.location.hostname,
      allowCredentials,
      userVerification: 'required',
    }

    return options
  }

  /**
   * Authenticate with existing passkey
   */
  async authenticateWithPasskey(username?: string): Promise<PasskeySession> {
    try {
      if (!this.isSupported()) {
        throw new Error('WebAuthn is not supported in this browser')
      }

      const options = await this.generateAuthenticationOptions(username)
      
      // Get credential
      const credential = await navigator.credentials.get({
        publicKey: options,
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('Authentication cancelled or failed')
      }

      const response = credential.response as AuthenticatorAssertionResponse
      
      // Verify credential and get user
      const user = await this.verifyCredentialAndGetUser(credential, response, options.challenge)
      
      if (!user) {
        throw new Error('Invalid credential')
      }

      // Update credential usage
      await this.updateCredentialUsage(credential.id)

      // Create session
      const sessionData = await createUserSession(user.id, undefined)
      const session: PasskeySession = {
        sessionToken: sessionData.sessionToken,
        expiresAt: sessionData.expiresAt,
        user,
      }

      this.currentUser = user
      this.currentSession = session

      // Create audit log
      await databaseService.createAuditLog({
        userId: user.id,
        action: 'passkey_authentication',
        details: {
          credentialId: credential.id,
        },
      })

      console.log('Passkey authentication successful for user:', user.username)
      return session

    } catch (error) {
      console.error('Passkey authentication failed:', error)
      throw new Error('Failed to authenticate with passkey')
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      if (this.currentSession) {
        await revokeUserSession(this.currentSession.sessionToken)
        
        // Create audit log
        if (this.currentUser) {
          await databaseService.createAuditLog({
            userId: this.currentUser.id,
            action: 'passkey_logout',
            details: {},
          })
        }
      }

      this.currentUser = null
      this.currentSession = null

      console.log('Passkey sign out successful')
    } catch (error) {
      console.error('Passkey sign out failed:', error)
      throw new Error('Failed to sign out')
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): PasskeyUser | null {
    return this.currentUser
  }

  /**
   * Get current session
   */
  getCurrentSession(): PasskeySession | null {
    return this.currentSession
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.currentUser && this.currentSession)
  }

  /**
   * Get user's wallet address (for compatibility with Privy auth)
   */
  getWalletAddress(): string | null {
    // For passkey users, we generate a deterministic address from their user ID
    if (!this.currentUser) return null
    
    // This is a placeholder - in production, you might want to:
    // 1. Let users connect an external wallet
    // 2. Generate a smart contract wallet
    // 3. Use a deterministic address derivation
    return `0x${this.currentUser.id.slice(0, 40)}`
  }

  /**
   * Sign a message (for compatibility with Privy auth)
   */
  async signMessage(message: string): Promise<string> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated')
    }

    // For passkey authentication, we can't sign arbitrary messages
    // This would require integration with a wallet or smart contract wallet
    throw new Error('Message signing not supported with passkey authentication. Please connect a wallet.')
  }

  /**
   * Sign typed data (for compatibility with Privy auth)
   */
  async signTypedData(typedData: any): Promise<string> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated')
    }

    // For passkey authentication, we can't sign typed data
    // This would require integration with a wallet or smart contract wallet
    throw new Error('Typed data signing not supported with passkey authentication. Please connect a wallet.')
  }

  // Private helper methods

  private getAlgorithmFromCredential(response: AuthenticatorAttestationResponse): number {
    // Default to ES256 if we can't determine the algorithm
    return -7
  }

  private getCounterFromAuthenticatorData(authData: ArrayBuffer): number {
    // Extract counter from authenticator data (bytes 33-36)
    const view = new DataView(authData)
    return view.getUint32(33, false) // big-endian
  }

  private async storeUserCredentials(user: PasskeyUser): Promise<void> {
    // Store user credentials in database (implementation depends on your database schema)
    // This is a placeholder - you would implement actual database storage
    console.log('Storing user credentials for:', user.username)
  }

  private async getUserCredentials(username: string): Promise<PasskeyCredential[]> {
    // Retrieve user credentials from database
    // This is a placeholder - you would implement actual database retrieval
    console.log('Retrieving credentials for:', username)
    return []
  }

  private async verifyCredentialAndGetUser(
    credential: PublicKeyCredential,
    response: AuthenticatorAssertionResponse,
    challenge: ArrayBuffer
  ): Promise<PasskeyUser | null> {
    // Verify the credential signature and return the user
    // This is a placeholder - you would implement actual cryptographic verification
    console.log('Verifying credential:', credential.id)
    
    // For now, return a mock user
    return {
      id: 'passkey_user_' + credential.id.slice(0, 8),
      username: 'passkey_user',
      displayName: 'Passkey User',
      credentials: [],
      createdAt: new Date(),
    }
  }

  private async updateCredentialUsage(credentialId: string): Promise<void> {
    // Update the last used timestamp for the credential
    console.log('Updating credential usage:', credentialId)
  }
}

// Export singleton instance
export const passkeyAuthService = PasskeyAuthService.getInstance() 