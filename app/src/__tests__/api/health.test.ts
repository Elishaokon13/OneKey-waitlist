/**
 * Health API Endpoint Tests
 * Tests for the health check API functionality
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/health/route'

// Mock the database service
jest.mock('@/lib/database', () => ({
  databaseService: {
    getHealthStatus: jest.fn().mockResolvedValue({
      status: 'healthy',
      responseTime: 50,
      tables: {
        users: 0,
        sessions: 0,
        attestations: 0,
        auditLogs: 0,
      },
      timestamp: new Date().toISOString(),
    }),
  },
}))

// Mock the services manager
jest.mock('@/lib/services', () => ({
  servicesManager: {
    getHealthCheck: jest.fn().mockResolvedValue({
      overall: {
        healthy: true,
        initialized: false,
        timestamp: new Date().toISOString(),
      },
      services: {
        privy: { service: 'privy', initialized: false, configured: true },
        eas: { service: 'eas', initialized: false, configured: true },
        lit: { service: 'lit', initialized: false, configured: true },
        storage: { service: 'storage', initialized: false, configured: true },
      },
    }),
  },
}))

describe('/api/health', () => {
  it('should return health status successfully', async () => {
    const request = new NextRequest('http://localhost:3001/api/health')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('responseTime')
    expect(data).toHaveProperty('components')
    expect(data.components).toHaveProperty('database')
    expect(data.components).toHaveProperty('services')
  })

  it('should include system information', async () => {
    const request = new NextRequest('http://localhost:3001/api/health')
    const response = await GET(request)
    
    const data = await response.json()
    expect(data).toHaveProperty('version')
    expect(data).toHaveProperty('environment')
    expect(data).toHaveProperty('uptime')
    expect(data).toHaveProperty('memory')
    expect(data.memory).toHaveProperty('used')
    expect(data.memory).toHaveProperty('total')
  })

  it('should handle database health status', async () => {
    const request = new NextRequest('http://localhost:3001/api/health')
    const response = await GET(request)
    
    const data = await response.json()
    expect(data.components.database).toHaveProperty('status', 'healthy')
    expect(data.components.database).toHaveProperty('responseTime')
    expect(data.components.database).toHaveProperty('tables')
  })

  it('should handle services health status', async () => {
    const request = new NextRequest('http://localhost:3001/api/health')
    const response = await GET(request)
    
    const data = await response.json()
    expect(data.components.services).toHaveProperty('overall')
    expect(data.components.services).toHaveProperty('services')
    expect(data.components.services.overall).toHaveProperty('healthy')
    expect(data.components.services.overall).toHaveProperty('initialized')
  })
}) 