/**
 * Unified Authentication Manager Tests
 * Tests for the unified authentication system
 */

import { UnifiedAuthManager } from '@/lib/auth/unified-auth'
import { privyAuthService } from '@/lib/auth/privy-auth'
import { passkeyAuthService } from '@/lib/auth/passkey-auth'
import { databaseService } from '@/lib/database'

// Mock Prisma first
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}))

// Mock the middleware
jest.mock('@/lib/middleware/auth', () => ({
  authMiddleware: {
    getCurrentUser: jest.fn().mockReturnValue(null),
  },
}))

// Mock the authentication services
jest.mock('@/lib/auth/privy-auth', () => ({
  privyAuthService: {
    isInitialized: jest.fn(),
    isAuthenticated: jest.fn(),
    getCurrentSession: jest.fn(),
    loginWithEmail: jest.fn(),
    loginWithWallet: jest.fn(),
    logout: jest.fn(),
    signMessage: jest.fn(),
    signTypedData: jest.fn(),
    getWalletAddress: jest.fn(),
  },
}))

jest.mock('@/lib/auth/passkey-auth', () => ({
  passkeyAuthService: {
    isSupported: jest.fn(),
    isPlatformAuthenticatorAvailable: jest.fn(),
    isAuthenticated: jest.fn(),
    registerPasskey: jest.fn(),
    authenticateWithPasskey: jest.fn(),
    signOut: jest.fn(),
    signMessage: jest.fn(),
    signTypedData: jest.fn(),
    getWalletAddress: jest.fn(),
  },
}))

jest.mock('@/lib/database', () => ({
  databaseService: {
    createAuditLog: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock Request for Next.js compatibility
global.Request = jest.fn().mockImplementation(() => ({
  headers: new Map(),
  nextUrl: { pathname: '/' },
}))

// Mock console methods
jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

describe('UnifiedAuthManager', () => {
  let authManager: UnifiedAuthManager
  const mockPrivyAuthService = privyAuthService as jest.Mocked<typeof privyAuthService>
  const mockPasskeyAuthService = passkeyAuthService as jest.Mocked<typeof passkeyAuthService>
  const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // Reset singleton instance
    ;(UnifiedAuthManager as any).instance = undefined
    authManager = UnifiedAuthManager.getInstance()

    // Setup default mocks
    mockPrivyAuthService.isInitialized.mockReturnValue(true)
    mockPasskeyAuthService.isSupported.mockReturnValue(true)
    mockPasskeyAuthService.isPlatformAuthenticatorAvailable.mockResolvedValue(true)
    mockDatabaseService.createAuditLog.mockResolvedValue(undefined)
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = UnifiedAuthManager.getInstance()
      const instance2 = UnifiedAuthManager.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('getAuthCapabilities', () => {
    it('should return capabilities for both auth methods', async () => {
      process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'test-app-id'
      
      const capabilities = await authManager.getAuthCapabilities()

      expect(capabilities).toEqual({
        privy: {
          available: true,
          configured: true,
        },
        passkey: {
          available: true,
          supported: true,
          platformAuthenticator: true,
        },
      })
    })

    it('should handle missing Privy configuration', async () => {
      delete process.env.NEXT_PUBLIC_PRIVY_APP_ID
      mockPrivyAuthService.isInitialized.mockReturnValue(false)

      const capabilities = await authManager.getAuthCapabilities()

      expect(capabilities.privy.available).toBe(false)
      expect(capabilities.privy.configured).toBe(false)
    })

    it('should handle unsupported passkey', async () => {
      mockPasskeyAuthService.isSupported.mockReturnValue(false)
      mockPasskeyAuthService.isPlatformAuthenticatorAvailable.mockResolvedValue(false)

      const capabilities = await authManager.getAuthCapabilities()

      expect(capabilities.passkey.supported).toBe(false)
      expect(capabilities.passkey.platformAuthenticator).toBe(false)
    })
  })

  describe('Preferences Management', () => {
    it('should return default preferences', () => {
      const preferences = authManager.getPreferences()
      
      expect(preferences).toEqual({
        preferredMethod: 'privy',
        allowFallback: true,
        rememberChoice: true,
      })
    })

    it('should load preferences from localStorage', () => {
      const storedPrefs = {
        preferredMethod: 'passkey',
        allowFallback: false,
        rememberChoice: true,
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedPrefs))
      
      // Create new instance to trigger loading
      ;(UnifiedAuthManager as any).instance = undefined
      
      // Mock the localStorage check
      global.localStorage = localStorageMock as any
      
      authManager = UnifiedAuthManager.getInstance()
      
      const preferences = authManager.getPreferences()
      expect(preferences.preferredMethod).toBe('passkey')
      expect(preferences.allowFallback).toBe(false)
    })

    it('should save preferences to localStorage', async () => {
      // Ensure global localStorage is set
      global.localStorage = localStorageMock as any
      
      const newPrefs = { preferredMethod: 'passkey' as const }
      
      await authManager.setPreferences(newPrefs)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth-preferences',
        expect.stringContaining('passkey')
      )
    })

    it('should not save preferences if rememberChoice is false', async () => {
      // Ensure global localStorage is set
      global.localStorage = localStorageMock as any
      
      await authManager.setPreferences({ rememberChoice: false })
      await authManager.setPreferences({ preferredMethod: 'passkey' })
      
      // Should only be called once for the rememberChoice update (not for the second call)
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('Authentication', () => {
    const mockPrivySession = {
      sessionToken: 'privy-token',
      expiresAt: new Date(Date.now() + 3600000),
      user: {
        privyId: 'privy-user-1',
        email: { address: 'test@example.com' },
        walletAddress: '0x123...',
        createdAt: new Date(),
      },
    }

    const mockPasskeySession = {
      sessionToken: 'passkey-token',
      expiresAt: new Date(Date.now() + 3600000),
      user: {
        id: 'passkey-user-1',
        username: 'testuser',
        displayName: 'Test User',
        createdAt: new Date(),
      },
    }

    it('should authenticate with Privy when preferred', async () => {
      mockPrivyAuthService.loginWithWallet.mockResolvedValue(mockPrivySession)
      mockPrivyAuthService.isAuthenticated.mockReturnValue(false)

      const session = await authManager.authenticate({ method: 'privy' })

      expect(session.authMethod).toBe('privy')
      expect(session.user.authMethod).toBe('privy')
      expect(mockPrivyAuthService.loginWithWallet).toHaveBeenCalled()
    })

    it('should authenticate with Passkey when preferred', async () => {
      mockPasskeyAuthService.authenticateWithPasskey.mockResolvedValue(mockPasskeySession)

      const session = await authManager.authenticate({ 
        method: 'passkey',
        username: 'testuser',
      })

      expect(session.authMethod).toBe('passkey')
      expect(session.user.authMethod).toBe('passkey')
      expect(mockPasskeyAuthService.authenticateWithPasskey).toHaveBeenCalledWith('testuser')
    })

    it('should authenticate with email using Privy', async () => {
      mockPrivyAuthService.loginWithEmail.mockResolvedValue(mockPrivySession)

      const session = await authManager.authenticate({ 
        method: 'privy',
        email: 'test@example.com',
      })

      expect(mockPrivyAuthService.loginWithEmail).toHaveBeenCalledWith('test@example.com')
    })

    it('should fallback to passkey when Privy fails', async () => {
      mockPrivyAuthService.isInitialized.mockReturnValue(false)
      mockPasskeyAuthService.authenticateWithPasskey.mockResolvedValue(mockPasskeySession)

      const session = await authManager.authenticate({ method: 'privy' })

      expect(session.authMethod).toBe('passkey')
      expect(mockPasskeyAuthService.authenticateWithPasskey).toHaveBeenCalled()
    })

    it('should fallback to Privy when Passkey fails', async () => {
      mockPasskeyAuthService.isSupported.mockReturnValue(false)
      mockPrivyAuthService.loginWithWallet.mockResolvedValue(mockPrivySession)
      mockPrivyAuthService.isAuthenticated.mockReturnValue(false)

      const session = await authManager.authenticate({ method: 'passkey' })

      expect(session.authMethod).toBe('privy')
      expect(mockPrivyAuthService.loginWithWallet).toHaveBeenCalled()
    })

    it('should throw error when no auth method available', async () => {
      mockPrivyAuthService.isInitialized.mockReturnValue(false)
      mockPasskeyAuthService.isSupported.mockReturnValue(false)

      await expect(authManager.authenticate()).rejects.toThrow('Authentication failed')
    })

    it('should not fallback when disabled', async () => {
      await authManager.setPreferences({ allowFallback: false })
      mockPrivyAuthService.isInitialized.mockReturnValue(false)

      await expect(authManager.authenticate({ method: 'privy' })).rejects.toThrow('Authentication failed')
      expect(mockPasskeyAuthService.authenticateWithPasskey).not.toHaveBeenCalled()
    })
  })

  describe('Registration', () => {
    it('should register with Passkey', async () => {
      const mockUser = {
        id: 'passkey-user-1',
        username: 'testuser',
        displayName: 'Test User',
        createdAt: new Date(),
      }
      const mockSession = {
        sessionToken: 'passkey-token',
        expiresAt: new Date(Date.now() + 3600000),
        user: mockUser,
      }

      mockPasskeyAuthService.registerPasskey.mockResolvedValue(mockUser)
      mockPasskeyAuthService.authenticateWithPasskey.mockResolvedValue(mockSession)

      const session = await authManager.register('passkey', {
        username: 'testuser',
        displayName: 'Test User',
      })

      expect(session.authMethod).toBe('passkey')
      expect(mockPasskeyAuthService.registerPasskey).toHaveBeenCalledWith('testuser', 'Test User')
    })

    it('should require username and displayName for Passkey registration', async () => {
      await expect(authManager.register('passkey', {})).rejects.toThrow(
        'Username and display name required'
      )
    })
  })

  describe('Message Signing', () => {
    beforeEach(() => {
      // Set up authenticated state
      mockPrivyAuthService.isAuthenticated.mockReturnValue(true)
      ;(authManager as any).currentMethod = 'privy'
      ;(authManager as any).currentUser = { id: 'user-1' }
      ;(authManager as any).currentSession = { sessionToken: 'token' }
    })

    it('should sign message with Privy', async () => {
      mockPrivyAuthService.signMessage.mockResolvedValue('signature')
      mockPrivyAuthService.getWalletAddress.mockReturnValue('0x123...')

      const result = await authManager.signMessage('test message')

      expect(result).toEqual({
        signature: 'signature',
        message: 'test message',
        address: '0x123...',
        method: 'privy',
      })
      expect(mockDatabaseService.createAuditLog).toHaveBeenCalledWith({
        userId: 'user-1',
        action: 'message_signed',
        details: {
          method: 'privy',
          messageHash: expect.any(String),
        },
      })
    })

    it('should handle Passkey signing failure gracefully', async () => {
      ;(authManager as any).currentMethod = 'passkey'
      mockPasskeyAuthService.signMessage.mockRejectedValue(new Error('Not supported'))

      await expect(authManager.signMessage('test')).rejects.toThrow(
        'Message signing requires wallet connection'
      )
    })

    it('should require authentication for signing', async () => {
      ;(authManager as any).currentUser = null

      await expect(authManager.signMessage('test')).rejects.toThrow('User not authenticated')
    })
  })

  describe('Method Switching', () => {
    it('should switch from Privy to Passkey', async () => {
      // Set up initial Privy authentication
      ;(authManager as any).currentMethod = 'privy'
      ;(authManager as any).currentUser = { id: 'user-1' }
      ;(authManager as any).currentSession = { sessionToken: 'token' }
      
      const mockPasskeySession = {
        sessionToken: 'passkey-token',
        expiresAt: new Date(Date.now() + 3600000),
        user: {
          id: 'passkey-user-1',
          username: 'testuser',
          displayName: 'Test User',
        },
      }

      mockPrivyAuthService.logout.mockResolvedValue(undefined)
      mockPasskeyAuthService.authenticateWithPasskey.mockResolvedValue(mockPasskeySession)

      const session = await authManager.switchAuthMethod('passkey')

      expect(session.authMethod).toBe('passkey')
      expect(mockPrivyAuthService.logout).toHaveBeenCalled()
    })

    it('should throw error for unavailable method', async () => {
      mockPasskeyAuthService.isSupported.mockReturnValue(false)

      await expect(authManager.switchAuthMethod('passkey')).rejects.toThrow(
        'Passkey authentication not supported'
      )
    })
  })

  describe('Sign Out', () => {
    beforeEach(() => {
      ;(authManager as any).currentMethod = 'privy'
      ;(authManager as any).currentUser = { id: 'user-1' }
      ;(authManager as any).currentSession = { sessionToken: 'token' }
    })

    it('should sign out from Privy', async () => {
      mockPrivyAuthService.logout.mockResolvedValue(undefined)

      await authManager.signOut()

      expect(mockPrivyAuthService.logout).toHaveBeenCalled()
      expect(authManager.isAuthenticated()).toBe(false)
      expect(mockDatabaseService.createAuditLog).toHaveBeenCalledWith({
        userId: 'user-1',
        action: 'unified_logout',
        details: { method: 'privy' },
      })
    })

    it('should clear preferences when requested', async () => {
      // Ensure global localStorage is set
      global.localStorage = localStorageMock as any
      
      mockPrivyAuthService.logout.mockResolvedValue(undefined)

      await authManager.signOut(true)

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-preferences')
      const preferences = authManager.getPreferences()
      expect(preferences.preferredMethod).toBe('privy')
    })
  })

  describe('State Management', () => {
    it('should track authentication state', () => {
      expect(authManager.isAuthenticated()).toBe(false)
      expect(authManager.getCurrentUser()).toBeNull()
      expect(authManager.getCurrentSession()).toBeNull()
      expect(authManager.getCurrentMethod()).toBeNull()
    })

    it('should get wallet address from current method', () => {
      ;(authManager as any).currentMethod = 'privy'
      mockPrivyAuthService.getWalletAddress.mockReturnValue('0x123...')

      expect(authManager.getWalletAddress()).toBe('0x123...')
    })

    it('should return null wallet address when not authenticated', () => {
      expect(authManager.getWalletAddress()).toBeNull()
    })
  })

  describe('Helper Methods', () => {
    it('should convert Privy user correctly', () => {
      const privyUser = {
        privyId: 'privy-123',
        email: { address: 'test@example.com' },
        walletAddress: '0x123...',
        createdAt: new Date('2023-01-01'),
      }

      const result = (authManager as any).convertPrivyUser(privyUser)

      expect(result).toEqual({
        id: 'privy-123',
        authMethod: 'privy',
        walletAddress: '0x123...',
        displayName: 'test@example.com',
        email: 'test@example.com',
        createdAt: new Date('2023-01-01'),
        lastLoginAt: expect.any(Date),
      })
    })

    it('should convert Passkey user correctly', () => {
      const passkeyUser = {
        id: 'passkey-123',
        username: 'testuser',
        displayName: 'Test User',
        createdAt: new Date('2023-01-01'),
      }

      mockPasskeyAuthService.getWalletAddress.mockReturnValue(null)

      const result = (authManager as any).convertPasskeyUser(passkeyUser)

      expect(result).toEqual({
        id: 'passkey-123',
        authMethod: 'passkey',
        walletAddress: null,
        displayName: 'Test User',
        username: 'testuser',
        createdAt: new Date('2023-01-01'),
        lastLoginAt: expect.any(Date),
      })
    })

    it('should hash messages for audit logging', () => {
      const hash1 = (authManager as any).hashMessage('test message')
      const hash2 = (authManager as any).hashMessage('test message')
      const hash3 = (authManager as any).hashMessage('different message')

      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(hash3)
      expect(typeof hash1).toBe('string')
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      // Should not throw during initialization
      ;(UnifiedAuthManager as any).instance = undefined
      expect(() => UnifiedAuthManager.getInstance()).not.toThrow()
    })

    it('should handle authentication service errors', async () => {
      mockPrivyAuthService.loginWithWallet.mockRejectedValue(new Error('Service error'))
      mockPrivyAuthService.isAuthenticated.mockReturnValue(false)

      await expect(authManager.authenticate({ method: 'privy' })).rejects.toThrow('Authentication failed')
    })

    it('should handle audit logging errors gracefully', async () => {
      mockDatabaseService.createAuditLog.mockRejectedValue(new Error('Database error'))
      
      const newPrefs = { preferredMethod: 'passkey' as const }
      
      // Should not throw even if audit logging fails
      await expect(authManager.setPreferences(newPrefs)).resolves.not.toThrow()
    })
  })
}) 