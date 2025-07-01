/**
 * Database Service Tests
 * Tests for database operations and health checks
 */

import { databaseService } from '@/lib/database'

describe('Database Service', () => {
  beforeAll(async () => {
    // Ensure database is connected
    await databaseService.testConnection()
  })

  afterAll(async () => {
    // Clean up test data and disconnect
    try {
      // Clean up any test data
      await databaseService.getClient().auditLog.deleteMany({
        where: { action: { contains: 'test_' } }
      })
      await databaseService.getClient().session.deleteMany({
        where: { sessionToken: { contains: 'test_' } }
      })
      await databaseService.getClient().user.deleteMany({
        where: { walletAddress: { contains: 'test_' } }
      })
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
    
    await databaseService.disconnect()
  })

  describe('Connection and Health', () => {
    it('should test database connection successfully', async () => {
      const isConnected = await databaseService.testConnection()
      expect(isConnected).toBe(true)
    })

    it('should provide health status', async () => {
      const health = await databaseService.getHealthStatus()
      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('timestamp')
      
      if (health.status === 'healthy') {
        expect(health).toHaveProperty('responseTime')
        expect(health).toHaveProperty('tables')
        expect(typeof health.responseTime).toBe('number')
        expect(health.tables).toHaveProperty('users')
        expect(health.tables).toHaveProperty('sessions')
        expect(health.tables).toHaveProperty('attestations')
        expect(health.tables).toHaveProperty('auditLogs')
      }
    })
  })

  describe('Audit Logging', () => {
    it('should create audit log entries', async () => {
      const auditData = {
        action: 'test_action',
        resource: 'test_resource',
        metadata: { test: 'data' },
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      }

      const auditLog = await databaseService.createAuditLog(auditData)
      
      expect(auditLog).toHaveProperty('id')
      expect(auditLog.action).toBe('test_action')
      expect(auditLog.resource).toBe('test_resource')
      expect(auditLog.ipAddress).toBe('127.0.0.1')
      expect(auditLog.userAgent).toBe('test-agent')
      expect(auditLog.metadata).toBe(JSON.stringify({ test: 'data' }))
    })

    it('should create audit log with minimal data', async () => {
      const auditLog = await databaseService.createAuditLog({
        action: 'test_minimal_action',
      })
      
      expect(auditLog).toHaveProperty('id')
      expect(auditLog.action).toBe('test_minimal_action')
      expect(auditLog.userId).toBeNull()
      expect(auditLog.resource).toBeNull()
      expect(auditLog.metadata).toBeNull()
    })
  })

  describe('System Configuration', () => {
    it('should set and get system configuration', async () => {
      const key = 'test_config_key'
      const value = 'test_config_value'
      const category = 'test'

      // Set configuration
      await databaseService.setSystemConfig(key, value, category)

      // Get configuration
      const retrievedValue = await databaseService.getSystemConfig(key)
      expect(retrievedValue).toBe(value)
    })

    it('should return null for non-existent configuration', async () => {
      const value = await databaseService.getSystemConfig('non_existent_key')
      expect(value).toBeNull()
    })

    it('should update existing configuration', async () => {
      const key = 'test_update_key'
      const initialValue = 'initial_value'
      const updatedValue = 'updated_value'

      // Set initial value
      await databaseService.setSystemConfig(key, initialValue)
      let value = await databaseService.getSystemConfig(key)
      expect(value).toBe(initialValue)

      // Update value
      await databaseService.setSystemConfig(key, updatedValue)
      value = await databaseService.getSystemConfig(key)
      expect(value).toBe(updatedValue)
    })
  })

  describe('Cleanup Operations', () => {
    it('should cleanup expired sessions', async () => {
      // Create a test user first
      const user = await databaseService.getClient().user.create({
        data: {
          walletAddress: 'test_cleanup_wallet',
        },
      })

      // Create an expired session
      await databaseService.getClient().session.create({
        data: {
          userId: user.id,
          sessionToken: 'test_expired_session',
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        },
      })

      // Create a valid session
      await databaseService.getClient().session.create({
        data: {
          userId: user.id,
          sessionToken: 'test_valid_session',
          expiresAt: new Date(Date.now() + 60000), // Expires in 1 minute
        },
      })

      // Cleanup expired sessions
      const cleanedCount = await databaseService.cleanupExpiredSessions()
      expect(cleanedCount).toBeGreaterThanOrEqual(1)

      // Verify expired session is gone
      const expiredSession = await databaseService.getClient().session.findUnique({
        where: { sessionToken: 'test_expired_session' },
      })
      expect(expiredSession).toBeNull()

      // Verify valid session still exists
      const validSession = await databaseService.getClient().session.findUnique({
        where: { sessionToken: 'test_valid_session' },
      })
      expect(validSession).not.toBeNull()
    })

    it('should cleanup expired access grants', async () => {
      // This test would require setting up users and attestations
      // For now, just test that the function doesn't throw
      const cleanedCount = await databaseService.cleanupExpiredAccessGrants()
      expect(typeof cleanedCount).toBe('number')
      expect(cleanedCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Database Client', () => {
    it('should provide access to Prisma client', () => {
      const client = databaseService.getClient()
      expect(client).toBeDefined()
      expect(typeof client.user).toBe('object')
      expect(typeof client.session).toBe('object')
      expect(typeof client.attestationReference).toBe('object')
      expect(typeof client.auditLog).toBe('object')
    })
  })
}) 