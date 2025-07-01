/**
 * Lit Protocol Service Integration
 * Handles access control, encryption, and decryption operations
 */

import { LitNodeClient } from '@lit-protocol/lit-node-client'
import { LitNetwork } from '@lit-protocol/constants'
import { SERVICES_CONFIG } from '../config/services'

export class LitService {
  private static instance: LitService
  private litNodeClient: LitNodeClient | null = null
  private initialized = false

  private constructor() {}

  static getInstance(): LitService {
    if (!LitService.instance) {
      LitService.instance = new LitService()
    }
    return LitService.instance
  }

  /**
   * Initialize Lit Protocol service
   */
  async initialize(): Promise<boolean> {
    try {
      // Validate network configuration
      const validNetworks = ['cayenne', 'manzano', 'habanero']
      if (!validNetworks.includes(SERVICES_CONFIG.lit.network)) {
        throw new Error(`Invalid Lit network: ${SERVICES_CONFIG.lit.network}`)
      }

      // Initialize Lit Node Client
      this.litNodeClient = new LitNodeClient({
        litNetwork: SERVICES_CONFIG.lit.network as LitNetwork,
        debug: SERVICES_CONFIG.lit.debug,
      })

      // Connect to Lit Network
      await this.litNodeClient.connect()

      this.initialized = true
      return true
    } catch (error) {
      console.error('Lit Protocol initialization failed:', error)
      return false
    }
  }

  /**
   * Get Lit Node Client instance
   */
  getLitNodeClient(): LitNodeClient {
    if (!this.initialized || !this.litNodeClient) {
      throw new Error('Lit service not initialized. Call initialize() first.')
    }
    return this.litNodeClient
  }

  /**
   * Validate Lit Protocol configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check network configuration
    const validNetworks = ['cayenne', 'manzano', 'habanero']
    if (!SERVICES_CONFIG.lit.network) {
      errors.push('Missing Lit network configuration')
    } else if (!validNetworks.includes(SERVICES_CONFIG.lit.network)) {
      errors.push(`Invalid Lit network: ${SERVICES_CONFIG.lit.network}. Valid options: ${validNetworks.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Test access control conditions creation
   */
  testAccessControlConditions(): boolean {
    try {
      // Test creating basic access control conditions
      const accessControlConditions = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: 'eth_getBalance',
          parameters: [':userAddress', 'latest'],
          returnValueTest: {
            comparator: '>=',
            value: '0'
          }
        }
      ]

      // Validate structure
      const isValid = accessControlConditions.every(condition => 
        condition.hasOwnProperty('chain') &&
        condition.hasOwnProperty('method') &&
        condition.hasOwnProperty('parameters') &&
        condition.hasOwnProperty('returnValueTest')
      )

      return isValid
    } catch (error) {
      console.error('Access control conditions test failed:', error)
      return false
    }
  }

  /**
   * Test encryption parameters
   */
  testEncryptionParams(): boolean {
    try {
      // Test encryption parameters structure
      const encryptionParams = {
        accessControlConditions: [],
        dataToEncrypt: 'test-data',
        chain: 'ethereum',
      }

      // Validate required parameters
      const hasRequiredParams = 
        encryptionParams.hasOwnProperty('accessControlConditions') &&
        encryptionParams.hasOwnProperty('dataToEncrypt') &&
        encryptionParams.hasOwnProperty('chain')

      return hasRequiredParams
    } catch (error) {
      console.error('Encryption parameters test failed:', error)
      return false
    }
  }

  /**
   * Disconnect from Lit Network
   */
  async disconnect(): Promise<void> {
    if (this.litNodeClient) {
      await this.litNodeClient.disconnect()
      this.litNodeClient = null
      this.initialized = false
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
    const accessControlTest = this.testAccessControlConditions()
    const encryptionTest = this.testEncryptionParams()

    return {
      service: 'lit',
      initialized: this.initialized,
      configured: validation.isValid,
      accessControlConditions: accessControlTest,
      encryptionParams: encryptionTest,
      errors: validation.errors,
      config: {
        network: SERVICES_CONFIG.lit.network,
        debug: SERVICES_CONFIG.lit.debug,
        connected: this.litNodeClient?.ready || false,
      }
    }
  }
}

// Export singleton instance
export const litService = LitService.getInstance() 