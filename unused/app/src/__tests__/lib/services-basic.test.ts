/**
 * Basic Services Configuration Tests
 * Tests service configuration and basic functionality without ES module dependencies
 */

import { SERVICES_CONFIG } from '@/lib/config/services'

describe('Services Configuration', () => {
  describe('Configuration Structure', () => {
    it('should have all required service configurations', () => {
      expect(SERVICES_CONFIG).toHaveProperty('privy')
      expect(SERVICES_CONFIG).toHaveProperty('eas')
      expect(SERVICES_CONFIG).toHaveProperty('lit')
      expect(SERVICES_CONFIG).toHaveProperty('storage')
    })

    it('should have environment flags', () => {
      expect(SERVICES_CONFIG).toHaveProperty('isDevelopment')
      expect(SERVICES_CONFIG).toHaveProperty('isProduction')
      expect(SERVICES_CONFIG).toHaveProperty('isTest')
      expect(typeof SERVICES_CONFIG.isDevelopment).toBe('boolean')
      expect(typeof SERVICES_CONFIG.isProduction).toBe('boolean')
      expect(typeof SERVICES_CONFIG.isTest).toBe('boolean')
    })
  })

  describe('Privy Configuration', () => {
    it('should have valid privy configuration', () => {
      const { privy } = SERVICES_CONFIG
      expect(privy).toHaveProperty('appId')
      expect(privy).toHaveProperty('config')
      expect(typeof privy.appId).toBe('string')
    })

    it('should have valid login methods', () => {
      const { loginMethods } = SERVICES_CONFIG.privy.config
      expect(Array.isArray(loginMethods)).toBe(true)
      expect(loginMethods.length).toBeGreaterThan(0)
      
      const validMethods = ['email', 'wallet', 'sms', 'google', 'twitter', 'discord', 'github', 'linkedin']
      loginMethods.forEach(method => {
        expect(validMethods).toContain(method)
      })
    })

    it('should have valid appearance configuration', () => {
      const { appearance } = SERVICES_CONFIG.privy.config
      expect(appearance).toHaveProperty('theme')
      expect(appearance).toHaveProperty('accentColor')
      expect(['light', 'dark']).toContain(appearance.theme)
    })
  })

  describe('EAS Configuration', () => {
    it('should have valid EAS configuration', () => {
      const { eas } = SERVICES_CONFIG
      expect(eas).toHaveProperty('schemaUID')
      expect(eas).toHaveProperty('contractAddress')
      expect(eas).toHaveProperty('graphQLEndpoint')
      expect(eas).toHaveProperty('rpcUrl')
      expect(typeof eas.schemaUID).toBe('string')
      expect(typeof eas.contractAddress).toBe('string')
    })

    it('should have valid contract address format', () => {
      const { contractAddress } = SERVICES_CONFIG.eas
      expect(contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })

    it('should have valid URLs', () => {
      const { graphQLEndpoint, rpcUrl } = SERVICES_CONFIG.eas
      expect(graphQLEndpoint).toMatch(/^https?:\/\//)
      expect(rpcUrl).toMatch(/^https?:\/\//)
    })
  })

  describe('Lit Protocol Configuration', () => {
    it('should have valid Lit configuration', () => {
      const { lit } = SERVICES_CONFIG
      expect(lit).toHaveProperty('network')
      expect(lit).toHaveProperty('debug')
      expect(typeof lit.network).toBe('string')
      expect(typeof lit.debug).toBe('boolean')
    })

    it('should have valid network', () => {
      const { network } = SERVICES_CONFIG.lit
      const validNetworks = ['cayenne', 'manzano', 'habanero']
      expect(validNetworks).toContain(network)
    })
  })

  describe('Storage Configuration', () => {
    it('should have valid storage configuration', () => {
      const { storage } = SERVICES_CONFIG
      expect(storage).toHaveProperty('lighthouse')
      expect(storage).toHaveProperty('arweave')
    })

    it('should have valid Lighthouse configuration', () => {
      const { lighthouse } = SERVICES_CONFIG.storage
      expect(lighthouse).toHaveProperty('apiKey')
      expect(lighthouse).toHaveProperty('endpoint')
      expect(typeof lighthouse.apiKey).toBe('string')
      expect(lighthouse.endpoint).toMatch(/^https?:\/\//)
    })

    it('should have valid Arweave configuration', () => {
      const { arweave } = SERVICES_CONFIG.storage
      expect(arweave).toHaveProperty('host')
      expect(arweave).toHaveProperty('port')
      expect(arweave).toHaveProperty('protocol')
      expect(arweave).toHaveProperty('timeout')
      expect(typeof arweave.host).toBe('string')
      expect(typeof arweave.port).toBe('number')
      expect(['http', 'https']).toContain(arweave.protocol)
    })
  })

  describe('Environment Variables', () => {
    it('should use test values in test environment', () => {
      // In test environment, should use test values
      expect(process.env.NODE_ENV).toBe('test')
      expect(SERVICES_CONFIG.isTest).toBe(true)
    })

    it('should have test configuration values', () => {
      // These should be the test values from jest.setup.js
      expect(process.env.NEXT_PUBLIC_PRIVY_APP_ID).toBe('test-privy-app-id')
      expect(process.env.NEXT_PUBLIC_EAS_SCHEMA_UID).toBe('test-schema-uid')
      expect(process.env.NEXT_PUBLIC_LIT_NETWORK).toBe('cayenne')
    })
  })
}) 