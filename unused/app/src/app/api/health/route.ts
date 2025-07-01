/**
 * Health Check API Endpoint
 * Provides system status including database, services, and overall health
 */

import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database'
import { servicesManager } from '@/lib/services'

export async function GET(request: NextRequest) {
  try {
    const start = Date.now()

    // Get database health
    const databaseHealth = await databaseService.getHealthStatus()

    // Get services health
    const servicesHealth = await servicesManager.getHealthCheck()

    // Calculate overall health
    const isDatabaseHealthy = databaseHealth.status === 'healthy'
    const areServicesHealthy = servicesHealth.overall.healthy
    const overallHealthy = isDatabaseHealthy && areServicesHealthy

    const responseTime = Date.now() - start

    const healthStatus = {
      status: overallHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      components: {
        database: databaseHealth,
        services: servicesHealth,
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    }

    // Return appropriate status code
    const statusCode = overallHealthy ? 200 : 503

    return NextResponse.json(healthStatus, { status: statusCode })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        components: {
          database: { status: 'unknown' },
          services: { status: 'unknown' },
        },
      },
      { status: 503 }
    )
  }
} 