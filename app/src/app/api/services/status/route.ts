/**
 * Services Status API Endpoint
 * Provides detailed status information about all integrated services
 */

import { NextRequest, NextResponse } from 'next/server'
import { servicesManager } from '@/lib/services'
import { withAuth } from '@/lib/middleware/auth'

async function handler(request: NextRequest) {
  try {
    // Get comprehensive services health check
    const servicesHealth = await servicesManager.getHealthCheck()

    // Add additional service information
    const serviceDetails = {
      ...servicesHealth,
      metadata: {
        totalServices: Object.keys(servicesHealth.services).length,
        healthyServices: Object.values(servicesHealth.services).filter(
          service => !service.hasOwnProperty('error') && service.initialized && service.configured
        ).length,
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(serviceDetails)
  } catch (error) {
    console.error('Services status check failed:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to get services status',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Export with optional authentication (for development, can be accessed without auth)
export const GET = withAuth(handler, { required: false }) 