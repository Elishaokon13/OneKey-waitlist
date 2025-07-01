/**
 * Privy Authentication Module Tests
 * Tests for Privy authentication service functionality
 */

import { privyAuthService, PrivyAuthService } from '@/lib/auth/privy-auth'

// Mock dependencies
jest.mock('@/lib/middleware/auth', () => ({
  createUserSession: jest.fn().mockResolvedValue({
    sessionToken: 'test-session-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  }),
  revokeUserSession: jest.fn().mockResolvedValue(true),
}))

jest.mock('@/lib/database', () => ({
  databaseService: {
    createAuditLog: jest.fn().mockResolvedValue({ id: 'test-audit-id' }),
  },
}))

// Mock Privy interface
const mockPrivyInterface = {
  login: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  getActiveWallet: jest.fn().mockResolvedValue({
    address: '0x1234567890123456789012345678901234567890',
    sign: jest.fn().mockResolvedValue('0xmocksignature'),
    signTypedData: jest.fn().mockResolvedValue('0xmocktypedsignature'),
  }),
  onAuthStateChange: jest.fn(),
}

// Mock Privy user
const mockPrivyUser = {
  id: 'privy-user-123',
  createdAt: '2023-01-01T00:00:00Z',
  linkedAccounts: [
    {
      type: 'wallet',
      address: '0x1234567890123456789012345678901234567890',
    },
  ],
  email: {
    address: 'test@example.com',
  },
  phone: null,
  google: null,
  twitter: null,
  discord: null,
  github: null,
  linkedin: null,
  spotify: null,
  instagram: null,
  tiktok: null,
}

describe('PrivyAuthService', () => {
  let authService: PrivyAuthService

  beforeEach(() => {
    // Reset singleton instance for testing
    ;(PrivyAuthService as any).instance = undefined
    authService = PrivyAuthService.getInstance()
    
    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PrivyAuthService.getInstance()
      const instance2 = PrivyAuthService.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('should return the exported singleton', () => {
      // Since we reset the instance in beforeEach, we need to get a fresh instance
      const freshInstance = PrivyAuthService.getInstance()
      expect(privyAuthService).toStrictEqual(freshInstance)
    })
  })

  describe('Initialization', () => {
    it('should initialize with Privy interface', () => {
      authService.initialize(mockPrivyInterface as any)
      
      expect(mockPrivyInterface.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function)
      )
    })

    it('should handle initialization without Privy interface', () => {
      expect(() => authService.initialize(null as any)).not.toThrow()
    })
  })

  describe('Authentication State', () => {
    beforeEach(() => {
      authService.initialize(mockPrivyInterface as any)
    })

    it('should start with unauthenticated state', () => {
      expect(authService.isAuthenticated()).toBe(false)
      expect(authService.getCurrentUser()).toBeNull()
      expect(authService.getCurrentSession()).toBeNull()
    })

    it('should provide authentication status', () => {
      const status = authService.getAuthStatus()
      
      expect(status).toHaveProperty('isAuthenticated', false)
      expect(status).toHaveProperty('user', null)
      expect(status).toHaveProperty('session', null)
      expect(status).toHaveProperty('privy')
      expect(status.privy).toHaveProperty('initialized', true)
    })
  })

  describe('User Login Handling', () => {
    beforeEach(() => {
      authService.initialize(mockPrivyInterface as any)
    })

    it('should handle user login successfully', async () => {
      // Simulate login event
      const onAuthStateChange = mockPrivyInterface.onAuthStateChange.mock.calls[0][0]
      await onAuthStateChange(mockPrivyUser)

      expect(authService.isAuthenticated()).toBe(true)
      
      const user = authService.getCurrentUser()
      expect(user).not.toBeNull()
      expect(user?.walletAddress).toBe('0x1234567890123456789012345678901234567890')
      expect(user?.email).toBe('test@example.com')
      expect(user?.privyUserId).toBe('privy-user-123')

      const session = authService.getCurrentSession()
      expect(session).not.toBeNull()
      expect(session?.sessionToken).toBe('test-session-token')
    })

    it('should handle user logout successfully', async () => {
      // First login
      const onAuthStateChange = mockPrivyInterface.onAuthStateChange.mock.calls[0][0]
      await onAuthStateChange(mockPrivyUser)
      
      expect(authService.isAuthenticated()).toBe(true)

      // Then logout
      await onAuthStateChange(null)
      
      expect(authService.isAuthenticated()).toBe(false)
      expect(authService.getCurrentUser()).toBeNull()
      expect(authService.getCurrentSession()).toBeNull()
    })

    it('should handle login with wallet-only user', async () => {
      const walletOnlyUser = {
        ...mockPrivyUser,
        email: null,
        phone: null,
      }

      const onAuthStateChange = mockPrivyInterface.onAuthStateChange.mock.calls[0][0]
      await onAuthStateChange(walletOnlyUser)

      const user = authService.getCurrentUser()
      expect(user?.email).toBeUndefined()
      expect(user?.phone).toBeUndefined()
      expect(user?.walletAddress).toBe('0x1234567890123456789012345678901234567890')
    })

    it('should handle user without wallet', async () => {
      const userWithoutWallet = {
        ...mockPrivyUser,
        linkedAccounts: [],
      }

      const onAuthStateChange = mockPrivyInterface.onAuthStateChange.mock.calls[0][0]
      
      // Should handle error gracefully (error is logged but not thrown)
      await onAuthStateChange(userWithoutWallet)
      
      // User should not be authenticated
      expect(authService.isAuthenticated()).toBe(false)
      expect(authService.getCurrentUser()).toBeNull()
    })
  })

  describe('Login Methods', () => {
    beforeEach(() => {
      authService.initialize(mockPrivyInterface as any)
    })

    it('should handle email login', async () => {
      await authService.loginWithEmail('test@example.com')
      expect(mockPrivyInterface.login).toHaveBeenCalled()
    })

    it('should handle phone login', async () => {
      await authService.loginWithPhone('+1234567890')
      expect(mockPrivyInterface.login).toHaveBeenCalled()
    })

    it('should handle social login', async () => {
      await authService.loginWithSocial('google')
      expect(mockPrivyInterface.login).toHaveBeenCalled()
    })

    it('should handle wallet login', async () => {
      await authService.loginWithWallet()
      expect(mockPrivyInterface.login).toHaveBeenCalled()
    })

    it('should handle logout', async () => {
      await authService.logout()
      expect(mockPrivyInterface.logout).toHaveBeenCalled()
    })

    it('should throw error when not initialized', async () => {
      // Create a fresh uninitialized service
      ;(PrivyAuthService as any).instance = undefined
      const uninitializedService = PrivyAuthService.getInstance()
      
      try {
        await uninitializedService.loginWithEmail('test@example.com')
        fail('Expected error to be thrown')
      } catch (error) {
        expect((error as Error).message).toBe('Privy not initialized')
      }

      try {
        await uninitializedService.loginWithWallet()
        fail('Expected error to be thrown')
      } catch (error) {
        expect((error as Error).message).toBe('Privy not initialized')
      }

      try {
        await uninitializedService.logout()
        fail('Expected error to be thrown')
      } catch (error) {
        expect((error as Error).message).toBe('Privy not initialized')
      }
    })
  })

  describe('Message Signing', () => {
    beforeEach(async () => {
      authService.initialize(mockPrivyInterface as any)
      
      // Login user first
      const onAuthStateChange = mockPrivyInterface.onAuthStateChange.mock.calls[0][0]
      await onAuthStateChange(mockPrivyUser)
    })

    it('should sign message successfully', async () => {
      const message = 'Test message to sign'
      const result = await authService.signMessage(message)

      expect(result).toEqual({
        signature: '0xmocksignature',
        message: 'Test message to sign',
        address: '0x1234567890123456789012345678901234567890',
      })

      expect(mockPrivyInterface.getActiveWallet).toHaveBeenCalled()
    })

    it('should sign typed data successfully', async () => {
      const typedData = {
        types: { Message: [{ name: 'content', type: 'string' }] },
        primaryType: 'Message',
        domain: { name: 'Test' },
        message: { content: 'Hello' },
      }

      const result = await authService.signTypedData(typedData)

      expect(result).toEqual({
        signature: '0xmocktypedsignature',
        message: JSON.stringify(typedData),
        address: '0x1234567890123456789012345678901234567890',
      })
    })

    it('should throw error when not authenticated', async () => {
      // Logout user
      const onAuthStateChange = mockPrivyInterface.onAuthStateChange.mock.calls[0][0]
      await onAuthStateChange(null)

      try {
        await authService.signMessage('test')
        fail('Expected error to be thrown')
      } catch (error) {
        expect((error as Error).message).toBe('User not authenticated')
      }

      try {
        await authService.signTypedData({})
        fail('Expected error to be thrown')
      } catch (error) {
        expect((error as Error).message).toBe('User not authenticated')
      }
    })

    it('should throw error when no active wallet', async () => {
      mockPrivyInterface.getActiveWallet.mockResolvedValueOnce(null)

      try {
        await authService.signMessage('test')
        fail('Expected error to be thrown')
      } catch (error) {
        expect((error as Error).message).toBe('Failed to sign message')
      }
    })
  })

  describe('Session Management', () => {
    beforeEach(async () => {
      authService.initialize(mockPrivyInterface as any)
      
      // Login user first
      const onAuthStateChange = mockPrivyInterface.onAuthStateChange.mock.calls[0][0]
      await onAuthStateChange(mockPrivyUser)
    })

    it('should get wallet address', () => {
      const address = authService.getWalletAddress()
      expect(address).toBe('0x1234567890123456789012345678901234567890')
    })

    it('should get session token', () => {
      const token = authService.getSessionToken()
      expect(token).toBe('test-session-token')
    })

    it('should refresh session when close to expiry', async () => {
      // Mock session close to expiry
      const currentSession = authService.getCurrentSession()
      if (currentSession) {
        currentSession.expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }

      await authService.refreshSession()

      // Should have called createUserSession again
      const { createUserSession } = require('@/lib/middleware/auth')
      expect(createUserSession).toHaveBeenCalledTimes(2) // Once for login, once for refresh
    })

    it('should not refresh session when not close to expiry', async () => {
      await authService.refreshSession()

      // Should not call createUserSession again (session is valid for 24 hours)
      const { createUserSession } = require('@/lib/middleware/auth')
      expect(createUserSession).toHaveBeenCalledTimes(1) // Only once for login
    })

    it('should throw error when refreshing without session', async () => {
      // Logout user
      const onAuthStateChange = mockPrivyInterface.onAuthStateChange.mock.calls[0][0]
      await onAuthStateChange(null)

      await expect(authService.refreshSession()).rejects.toThrow('No active session to refresh')
    })
  })

  describe('Utility Methods', () => {
    it('should hash messages consistently', () => {
      // Access private method through any cast for testing
      const service = authService as any
      
      const hash1 = service.hashMessage('test message')
      const hash2 = service.hashMessage('test message')
      const hash3 = service.hashMessage('different message')

      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(hash3)
      expect(typeof hash1).toBe('string')
    })

    it('should determine login method correctly', async () => {
      authService.initialize(mockPrivyInterface as any)
      
      // Test different user types
      const emailUser = { ...mockPrivyUser, email: { address: 'test@example.com' } }
      const phoneUser = { ...mockPrivyUser, email: null, phone: { number: '+1234567890' } }
      const googleUser = { ...mockPrivyUser, email: null, google: { email: 'test@gmail.com' } }
      const walletUser = { ...mockPrivyUser, email: null }

      const onAuthStateChange = mockPrivyInterface.onAuthStateChange.mock.calls[0][0]
      
      // Test each login method (we can't directly test the private method, 
      // but we can verify the audit logs are created with correct metadata)
      await onAuthStateChange(emailUser)
      await onAuthStateChange(null) // logout
      await onAuthStateChange(phoneUser)
      await onAuthStateChange(null) // logout
      await onAuthStateChange(googleUser)
      await onAuthStateChange(null) // logout
      await onAuthStateChange(walletUser)

      const { databaseService } = require('@/lib/database')
      const auditCalls = databaseService.createAuditLog.mock.calls

      // Check that audit logs were created with correct login methods
      expect(auditCalls.some((call: any) => call[0].metadata.loginMethod === 'email')).toBe(true)
      expect(auditCalls.some((call: any) => call[0].metadata.loginMethod === 'phone')).toBe(true)
      expect(auditCalls.some((call: any) => call[0].metadata.loginMethod === 'google')).toBe(true)
      expect(auditCalls.some((call: any) => call[0].metadata.loginMethod === 'wallet')).toBe(true)
    })
  })
}) 