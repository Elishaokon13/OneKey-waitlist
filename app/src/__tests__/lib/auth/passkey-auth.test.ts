/**
 * Passkey Authentication Module Tests
 * Tests for WebAuthn-based passkey authentication functionality
 */

import { passkeyAuthService, PasskeyAuthService } from '@/lib/auth/passkey-auth'

// Mock dependencies
jest.mock('@/lib/middleware/auth', () => ({
  createUserSession: jest.fn().mockResolvedValue({
    sessionToken: 'test-passkey-session-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  }),
  revokeUserSession: jest.fn().mockResolvedValue(true),
}))

jest.mock('@/lib/database', () => ({
  databaseService: {
    createAuditLog: jest.fn().mockResolvedValue({ id: 'test-audit-id' }),
  },
}))

describe('PasskeyAuthService', () => {
  let authService: PasskeyAuthService

  beforeEach(() => {
    // Reset singleton instance
    ;(PasskeyAuthService as any).instance = undefined
    authService = PasskeyAuthService.getInstance()
    
    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PasskeyAuthService.getInstance()
      const instance2 = PasskeyAuthService.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('should return the exported singleton', () => {
      const freshInstance = PasskeyAuthService.getInstance()
      expect(passkeyAuthService).toStrictEqual(freshInstance)
    })
  })

  describe('WebAuthn Support Detection', () => {
    it('should detect WebAuthn support when available', () => {
      // Mock supported environment
      Object.defineProperty(global, 'window', {
        value: {
          PublicKeyCredential: {},
          navigator: {
            credentials: {
              create: jest.fn(),
              get: jest.fn(),
            },
          },
        },
        writable: true,
      })

      ;(PasskeyAuthService as any).instance = undefined
      const freshService = PasskeyAuthService.getInstance()
      const isSupported = freshService.isSupported()
      expect(isSupported).toBe(true)
    })

    it('should detect WebAuthn not supported', () => {
      // Mock unsupported environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      ;(PasskeyAuthService as any).instance = undefined
      const freshService = PasskeyAuthService.getInstance()
      const isSupported = freshService.isSupported()
      expect(isSupported).toBe(false)
    })

    it('should handle platform authenticator check gracefully', async () => {
      // Since the platform authenticator check is complex to mock in Jest,
      // we'll test that it handles the unsupported case gracefully
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      ;(PasskeyAuthService as any).instance = undefined
      const freshService = PasskeyAuthService.getInstance()
      
      const isAvailable = await freshService.isPlatformAuthenticatorAvailable()
      expect(isAvailable).toBe(false)
    })

    it('should handle platform authenticator check errors', async () => {
      // Mock environment with error
      Object.defineProperty(global, 'window', {
        value: {
          PublicKeyCredential: {
            isUserVerifyingPlatformAuthenticatorAvailable: jest.fn().mockRejectedValue(new Error('Platform check failed')),
          },
          navigator: {
            credentials: {
              create: jest.fn(),
              get: jest.fn(),
            },
          },
        },
        writable: true,
      })

      ;(PasskeyAuthService as any).instance = undefined
      const freshService = PasskeyAuthService.getInstance()
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const isAvailable = await freshService.isPlatformAuthenticatorAvailable()
      
      expect(isAvailable).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Error checking platform authenticator:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Registration Options Generation', () => {
    beforeEach(() => {
      // Mock supported environment
      Object.defineProperty(global, 'window', {
        value: {
          location: { hostname: 'localhost' },
          crypto: {
            getRandomValues: jest.fn().mockImplementation((array) => {
              for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256)
              }
              return array
            }),
          },
          TextEncoder: class {
            encode(text: string) {
              return new Uint8Array(text.split('').map(c => c.charCodeAt(0)))
            }
          },
        },
        writable: true,
      })

      ;(PasskeyAuthService as any).instance = undefined
      authService = PasskeyAuthService.getInstance()
    })

    it('should generate valid registration options', async () => {
      const options = await authService.generateRegistrationOptions('testuser', 'Test User')
      
      expect(options).toHaveProperty('challenge')
      expect(options).toHaveProperty('rp')
      expect(options).toHaveProperty('user')
      expect(options).toHaveProperty('pubKeyCredParams')
      expect(options).toHaveProperty('authenticatorSelection')
      expect(options).toHaveProperty('timeout', 60000)
      expect(options).toHaveProperty('attestation', 'direct')

      expect(options.rp.name).toBe('Blink Protocol KYC')
      expect(options.rp.id).toBe('localhost')
      expect(options.user.name).toBe('testuser')
      expect(options.user.displayName).toBe('Test User')
    })

    it('should generate options with custom user ID', async () => {
      const customUserId = 'custom-user-id'
      const options = await authService.generateRegistrationOptions('testuser', 'Test User', customUserId)
      
      const expectedUserIdBuffer = new TextEncoder().encode(customUserId)
      expect(options.user.id).toEqual(expectedUserIdBuffer)
    })
  })

  describe('Authentication Options Generation', () => {
    beforeEach(() => {
      // Mock supported environment
      Object.defineProperty(global, 'window', {
        value: {
          location: { hostname: 'localhost' },
          crypto: {
            getRandomValues: jest.fn().mockImplementation((array) => {
              for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256)
              }
              return array
            }),
          },
        },
        writable: true,
      })

      ;(PasskeyAuthService as any).instance = undefined
      authService = PasskeyAuthService.getInstance()
    })

    it('should generate authentication options without username', async () => {
      const options = await authService.generateAuthenticationOptions()
      
      expect(options).toHaveProperty('challenge')
      expect(options).toHaveProperty('timeout', 60000)
      expect(options).toHaveProperty('rpId', 'localhost')
      expect(options).toHaveProperty('userVerification', 'required')
      expect(options.allowCredentials).toBeUndefined()
    })

    it('should generate authentication options with username', async () => {
      // Mock getUserCredentials to return some credentials
      const mockCredentials = [
        { id: 'cred1', publicKey: new ArrayBuffer(65), algorithm: -7, counter: 0, deviceType: 'platform', createdAt: new Date(), lastUsed: new Date() },
        { id: 'cred2', publicKey: new ArrayBuffer(65), algorithm: -7, counter: 0, deviceType: 'platform', createdAt: new Date(), lastUsed: new Date() },
      ]
      jest.spyOn(authService as any, 'getUserCredentials').mockResolvedValueOnce(mockCredentials)

      const options = await authService.generateAuthenticationOptions('testuser')
      
      expect(options.allowCredentials).toBeDefined()
      expect(options.allowCredentials).toHaveLength(2)
      expect(options.allowCredentials![0].type).toBe('public-key')
    })
  })

  describe('Error Handling', () => {
    it('should throw error when WebAuthn is not supported for registration', async () => {
      // Mock unsupported environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      ;(PasskeyAuthService as any).instance = undefined
      const freshService = PasskeyAuthService.getInstance()
      
      await expect(freshService.registerPasskey('testuser', 'Test User'))
        .rejects.toThrow('Failed to register passkey')
    })

    it('should throw error when WebAuthn is not supported for authentication', async () => {
      // Mock unsupported environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      ;(PasskeyAuthService as any).instance = undefined
      const freshService = PasskeyAuthService.getInstance()
      
      await expect(freshService.authenticateWithPasskey())
        .rejects.toThrow('Failed to authenticate with passkey')
    })
  })

  describe('Authentication State', () => {
    it('should start with unauthenticated state', () => {
      expect(authService.isAuthenticated()).toBe(false)
      expect(authService.getCurrentUser()).toBeNull()
      expect(authService.getCurrentSession()).toBeNull()
    })

    it('should provide null wallet address when not authenticated', () => {
      const walletAddress = authService.getWalletAddress()
      expect(walletAddress).toBeNull()
    })
  })

  describe('Wallet Compatibility', () => {
    it('should throw error for message signing when not authenticated', async () => {
      await expect(authService.signMessage('test'))
        .rejects.toThrow('User not authenticated')
    })

    it('should throw error for typed data signing when not authenticated', async () => {
      await expect(authService.signTypedData({}))
        .rejects.toThrow('User not authenticated')
    })
  })

  describe('Sign Out', () => {
    it('should handle sign out when not authenticated', async () => {
      // Should not throw error when signing out while not authenticated
      await expect(authService.signOut()).resolves.not.toThrow()
    })
  })

  describe('Helper Methods', () => {
    it('should get algorithm from credential', () => {
      const algorithm = (authService as any).getAlgorithmFromCredential({})
      expect(algorithm).toBe(-7) // ES256 default
    })

    it('should get counter from authenticator data', () => {
      const authData = new ArrayBuffer(37)
      const view = new DataView(authData)
      view.setUint32(33, 42, false) // Set counter to 42
      
      const counter = (authService as any).getCounterFromAuthenticatorData(authData)
      expect(counter).toBe(42)
    })

    it('should store user credentials', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      const user = {
        id: 'test-user',
        username: 'testuser',
        displayName: 'Test User',
        credentials: [],
        createdAt: new Date(),
      }
      
      await (authService as any).storeUserCredentials(user)
      expect(consoleSpy).toHaveBeenCalledWith('Storing user credentials for:', 'testuser')
      
      consoleSpy.mockRestore()
    })

    it('should retrieve user credentials', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      const credentials = await (authService as any).getUserCredentials('testuser')
      expect(credentials).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Retrieving credentials for:', 'testuser')
      
      consoleSpy.mockRestore()
    })

    it('should update credential usage', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      await (authService as any).updateCredentialUsage('test-credential-id')
      expect(consoleSpy).toHaveBeenCalledWith('Updating credential usage:', 'test-credential-id')
      
      consoleSpy.mockRestore()
    })
  })
}) 