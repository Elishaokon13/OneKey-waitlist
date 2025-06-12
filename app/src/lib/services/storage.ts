/**
 * Decentralized Storage Service Integration
 * Handles file storage and retrieval on Filecoin and Arweave
 */

import lighthouse from '@lighthouse-web3/sdk'
import Arweave from 'arweave'
import { SERVICES_CONFIG } from '../config/services'

export class StorageService {
  private static instance: StorageService
  private arweave: Arweave | null = null
  private initialized = false

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  /**
   * Initialize storage services
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize Arweave
      this.arweave = Arweave.init(SERVICES_CONFIG.storage.arweave)

      // Test Lighthouse configuration
      if (!SERVICES_CONFIG.storage.lighthouse.apiKey || SERVICES_CONFIG.storage.lighthouse.apiKey === 'test-lighthouse-key') {
        if (!SERVICES_CONFIG.isTest) {
          console.warn('Storage: Using test Lighthouse API key. Set LIGHTHOUSE_API_KEY for production.')
        }
      }

      this.initialized = true
      return true
    } catch (error) {
      console.error('Storage service initialization failed:', error)
      return false
    }
  }

  /**
   * Get Arweave instance
   */
  getArweave(): Arweave {
    if (!this.initialized || !this.arweave) {
      throw new Error('Storage service not initialized. Call initialize() first.')
    }
    return this.arweave
  }

  /**
   * Validate storage configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check Lighthouse configuration
    if (!SERVICES_CONFIG.storage.lighthouse.apiKey) {
      errors.push('Missing Lighthouse API key')
    }

    if (!SERVICES_CONFIG.storage.lighthouse.endpoint) {
      errors.push('Missing Lighthouse endpoint')
    } else if (!SERVICES_CONFIG.storage.lighthouse.endpoint.startsWith('http')) {
      errors.push('Invalid Lighthouse endpoint format')
    }

    // Check Arweave configuration
    if (!SERVICES_CONFIG.storage.arweave.host) {
      errors.push('Missing Arweave host')
    }

    if (!SERVICES_CONFIG.storage.arweave.port) {
      errors.push('Missing Arweave port')
    }

    if (!SERVICES_CONFIG.storage.arweave.protocol) {
      errors.push('Missing Arweave protocol')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Test Lighthouse upload functionality (mock)
   */
  async testLighthouseUpload(): Promise<boolean> {
    try {
      // Test upload parameters structure
      const testData = new Blob(['test data'], { type: 'text/plain' })
      const testFile = new File([testData], 'test.txt', { type: 'text/plain' })

      // Validate that we can create upload parameters
      const uploadParams = {
        file: testFile,
        apiKey: SERVICES_CONFIG.storage.lighthouse.apiKey,
        endpoint: SERVICES_CONFIG.storage.lighthouse.endpoint,
      }

      // Check if all required parameters are present
      const hasRequiredParams = 
        uploadParams.file instanceof File &&
        typeof uploadParams.apiKey === 'string' &&
        typeof uploadParams.endpoint === 'string'

      return hasRequiredParams
    } catch (error) {
      console.error('Lighthouse upload test failed:', error)
      return false
    }
  }

  /**
   * Test Arweave transaction creation
   */
  async testArweaveTransaction(): Promise<boolean> {
    try {
      if (!this.arweave) {
        return false
      }

      // Test creating a transaction structure
      const testData = 'test data'
      const testTransaction = await this.arweave.createTransaction({
        data: testData
      })

      // Validate transaction structure
      const hasRequiredFields = 
        testTransaction.hasOwnProperty('id') &&
        testTransaction.hasOwnProperty('data') &&
        testTransaction.hasOwnProperty('tags')

      return hasRequiredFields
    } catch (error) {
      console.error('Arweave transaction test failed:', error)
      return false
    }
  }

  /**
   * Test storage network connectivity
   */
  async testConnectivity(): Promise<{ lighthouse: boolean; arweave: boolean }> {
    const results = {
      lighthouse: false,
      arweave: false
    }

    // Test Lighthouse endpoint
    try {
      const response = await fetch(SERVICES_CONFIG.storage.lighthouse.endpoint, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      results.lighthouse = response.ok
    } catch (error) {
      console.error('Lighthouse connectivity test failed:', error)
    }

    // Test Arweave connectivity
    try {
      if (this.arweave) {
        const info = await this.arweave.network.getInfo()
        results.arweave = !!info.network
      }
    } catch (error) {
      console.error('Arweave connectivity test failed:', error)
    }

    return results
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
  async getStatus() {
    const validation = this.validateConfig()
    const lighthouseTest = await this.testLighthouseUpload()
    const arweaveTest = await this.testArweaveTransaction()
    const connectivity = await this.testConnectivity()

    return {
      service: 'storage',
      initialized: this.initialized,
      configured: validation.isValid,
      lighthouseUpload: lighthouseTest,
      arweaveTransaction: arweaveTest,
      connectivity,
      errors: validation.errors,
      config: {
        lighthouse: {
          apiKey: SERVICES_CONFIG.storage.lighthouse.apiKey ? '***configured***' : 'missing',
          endpoint: SERVICES_CONFIG.storage.lighthouse.endpoint,
        },
        arweave: {
          host: SERVICES_CONFIG.storage.arweave.host,
          port: SERVICES_CONFIG.storage.arweave.port,
          protocol: SERVICES_CONFIG.storage.arweave.protocol,
        }
      }
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance() 