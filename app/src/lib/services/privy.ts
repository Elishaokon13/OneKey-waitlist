/**
 * Privy Authentication Service Integration
 * Handles wallet creation, authentication, and signing operations
 */

import { PrivyProvider } from '@privy-io/react-auth'
import { SERVICES_CONFIG } from '../config/services'

export class PrivyService {
  private static instance: PrivyService
  private initialized = false

  private constructor() {}

  static getInstance(): PrivyService {
    if (!PrivyService.instance) {
      PrivyService.instance = new PrivyService()
    }
    return PrivyService.instance
  }

  /**
   * Initialize Privy service with configuration
   */
  async initialize(): Promise<boolean> {
    try {
      // Validate required configuration
      if (!SERVICES_CONFIG.privy.appId || SERVICES_CONFIG.privy.appId === 'test-privy-app-id') {
        if (!SERVICES_CONFIG.isTest) {
          console.warn('Privy: Using test app ID. Set NEXT_PUBLIC_PRIVY_APP_ID for production.')
        }
      }

      // Validate login methods configuration
      const validLoginMethods = ['email', 'wallet', 'sms', 'google', 'twitter', 'discord', 'github', 'linkedin']
      const configuredMethods = SERVICES_CONFIG.privy.config.loginMethods
      
      const invalidMethods = configuredMethods.filter(method => !validLoginMethods.includes(method))
      if (invalidMethods.length > 0) {
        throw new Error(`Invalid login methods configured: ${invalidMethods.join(', ')}`)
      }

      this.initialized = true
      return true
    } catch (error) {
      console.error('Privy initialization failed:', error)
      return false
    }
  }

  /**
   * Get Privy configuration for provider
   */
  getConfig() {
    if (!this.initialized) {
      throw new Error('Privy service not initialized. Call initialize() first.')
    }
    return SERVICES_CONFIG.privy
  }

  /**
   * Validate Privy provider configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check app ID
    if (!SERVICES_CONFIG.privy.appId) {
      errors.push('Missing NEXT_PUBLIC_PRIVY_APP_ID')
    }

    // Check login methods
    if (!SERVICES_CONFIG.privy.config.loginMethods.length) {
      errors.push('No login methods configured')
    }

    // Check theme configuration
    const validThemes = ['light', 'dark']
    if (!validThemes.includes(SERVICES_CONFIG.privy.config.appearance.theme)) {
      errors.push('Invalid theme configuration')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if service is properly initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Get service status for health checks
   */
  getStatus() {
    const validation = this.validateConfig()
    return {
      service: 'privy',
      initialized: this.initialized,
      configured: validation.isValid,
      errors: validation.errors,
      config: {
        appId: SERVICES_CONFIG.privy.appId ? '***configured***' : 'missing',
        loginMethods: SERVICES_CONFIG.privy.config.loginMethods,
        theme: SERVICES_CONFIG.privy.config.appearance.theme,
      }
    }
  }
}

// Export singleton instance
export const privyService = PrivyService.getInstance() 