/**
 * Database Service Layer
 * Provides clean interface for database operations using Prisma
 */

import { PrismaClient } from '@prisma/client'

// Global Prisma instance for development (prevents multiple instances)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database service class
export class DatabaseService {
  private static instance: DatabaseService
  private client: PrismaClient

  private constructor() {
    this.client = prisma
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  /**
   * Get Prisma client instance
   */
  getClient(): PrismaClient {
    return this.client
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database connection test failed:', error)
      return false
    }
  }

  /**
   * Get database health status
   */
  async getHealthStatus() {
    try {
      const start = Date.now()
      await this.client.$queryRaw`SELECT 1`
      const responseTime = Date.now() - start

      // Get table counts for basic stats
      const [userCount, sessionCount, attestationCount, auditLogCount] = await Promise.all([
        this.client.user.count(),
        this.client.session.count(),
        this.client.attestationReference.count(),
        this.client.auditLog.count(),
      ])

      return {
        status: 'healthy',
        responseTime,
        tables: {
          users: userCount,
          sessions: sessionCount,
          attestations: attestationCount,
          auditLogs: auditLogCount,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(data: {
    userId?: string
    action: string
    resource?: string
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      return await this.client.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      })
    } catch (error) {
      console.error('Failed to create audit log:', error)
      throw error
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.client.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })
      return result.count
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error)
      throw error
    }
  }

  /**
   * Cleanup expired access grants
   */
  async cleanupExpiredAccessGrants(): Promise<number> {
    try {
      const result = await this.client.accessGrant.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })
      return result.count
    } catch (error) {
      console.error('Failed to cleanup expired access grants:', error)
      throw error
    }
  }

  /**
   * Get system configuration
   */
  async getSystemConfig(key: string): Promise<string | null> {
    try {
      const config = await this.client.systemConfig.findUnique({
        where: { key, isActive: true },
      })
      return config?.value || null
    } catch (error) {
      console.error('Failed to get system config:', error)
      return null
    }
  }

  /**
   * Set system configuration
   */
  async setSystemConfig(key: string, value: string, category: string = 'general'): Promise<void> {
    try {
      await this.client.systemConfig.upsert({
        where: { key },
        update: { value, category, updatedAt: new Date() },
        create: { key, value, category },
      })
    } catch (error) {
      console.error('Failed to set system config:', error)
      throw error
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await this.client.$disconnect()
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance()

// Export Prisma client for direct use when needed
export { prisma as db } 