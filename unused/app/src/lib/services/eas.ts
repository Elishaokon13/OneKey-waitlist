/**
 * Ethereum Attestation Service (EAS) Integration
 * Handles attestation creation, verification, and schema management
 */

import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { ethers } from 'ethers'
import { SERVICES_CONFIG } from '../config/services'

export class EASService {
  private static instance: EASService
  private eas: EAS | null = null
  private initialized = false

  private constructor() {}

  static getInstance(): EASService {
    if (!EASService.instance) {
      EASService.instance = new EASService()
    }
    return EASService.instance
  }

  /**
   * Initialize EAS service with configuration
   */
  async initialize(): Promise<boolean> {
    try {
      // Validate configuration
      if (!SERVICES_CONFIG.eas.contractAddress) {
        throw new Error('EAS contract address not configured')
      }

      if (!SERVICES_CONFIG.eas.schemaUID || SERVICES_CONFIG.eas.schemaUID === 'test-schema-uid') {
        if (!SERVICES_CONFIG.isTest) {
          console.warn('EAS: Using test schema UID. Set NEXT_PUBLIC_EAS_SCHEMA_UID for production.')
        }
      }

      // Initialize EAS instance
      this.eas = new EAS(SERVICES_CONFIG.eas.contractAddress)

      // Test connection with a provider (read-only for initialization)
      if (SERVICES_CONFIG.eas.rpcUrl && SERVICES_CONFIG.eas.rpcUrl !== 'https://sepolia.infura.io/v3/your-key') {
        const provider = new ethers.JsonRpcProvider(SERVICES_CONFIG.eas.rpcUrl)
        this.eas.connect(provider)
      }

      this.initialized = true
      return true
    } catch (error) {
      console.error('EAS initialization failed:', error)
      return false
    }
  }

  /**
   * Get EAS instance
   */
  getEAS(): EAS {
    if (!this.initialized || !this.eas) {
      throw new Error('EAS service not initialized. Call initialize() first.')
    }
    return this.eas
  }

  /**
   * Validate EAS configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check contract address
    if (!SERVICES_CONFIG.eas.contractAddress) {
      errors.push('Missing EAS contract address')
    } else if (!ethers.isAddress(SERVICES_CONFIG.eas.contractAddress)) {
      errors.push('Invalid EAS contract address format')
    }

    // Check schema UID
    if (!SERVICES_CONFIG.eas.schemaUID) {
      errors.push('Missing EAS schema UID')
    } else if (!/^0x[a-fA-F0-9]{64}$/.test(SERVICES_CONFIG.eas.schemaUID)) {
      if (SERVICES_CONFIG.eas.schemaUID !== 'test-schema-uid') {
        errors.push('Invalid EAS schema UID format')
      }
    }

    // Check RPC URL
    if (!SERVICES_CONFIG.eas.rpcUrl) {
      errors.push('Missing RPC URL')
    } else if (!SERVICES_CONFIG.eas.rpcUrl.startsWith('http')) {
      errors.push('Invalid RPC URL format')
    }

    // Check GraphQL endpoint
    if (!SERVICES_CONFIG.eas.graphQLEndpoint) {
      errors.push('Missing GraphQL endpoint')
    } else if (!SERVICES_CONFIG.eas.graphQLEndpoint.startsWith('http')) {
      errors.push('Invalid GraphQL endpoint format')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Create a schema encoder for KYC attestations
   */
  createKYCSchemaEncoder(): SchemaEncoder {
    // KYC schema definition
    const schema = "bool verified,string provider,uint256 timestamp,bytes32 dataHash"
    return new SchemaEncoder(schema)
  }

  /**
   * Test schema encoding functionality
   */
  testSchemaEncoding(): boolean {
    try {
      const encoder = this.createKYCSchemaEncoder()
      
      // Test encoding with sample data
      const encodedData = encoder.encodeData([
        { name: "verified", value: true, type: "bool" },
        { name: "provider", value: "test-provider", type: "string" },
        { name: "timestamp", value: Math.floor(Date.now() / 1000), type: "uint256" },
        { name: "dataHash", value: "0x" + "0".repeat(64), type: "bytes32" }
      ])

      return encodedData.length > 0
    } catch (error) {
      console.error('Schema encoding test failed:', error)
      return false
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
    const schemaTest = this.initialized ? this.testSchemaEncoding() : false

    return {
      service: 'eas',
      initialized: this.initialized,
      configured: validation.isValid,
      schemaEncoding: schemaTest,
      errors: validation.errors,
      config: {
        contractAddress: SERVICES_CONFIG.eas.contractAddress,
        schemaUID: SERVICES_CONFIG.eas.schemaUID ? '***configured***' : 'missing',
        rpcUrl: SERVICES_CONFIG.eas.rpcUrl ? '***configured***' : 'missing',
        graphQLEndpoint: SERVICES_CONFIG.eas.graphQLEndpoint ? '***configured***' : 'missing',
      }
    }
  }
}

// Export singleton instance
export const easService = EASService.getInstance() 