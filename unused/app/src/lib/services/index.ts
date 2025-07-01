/**
 * Central Services Manager
 * Coordinates all service integrations and provides unified interface
 */

import { privyService } from './privy'
import { easService } from './eas'
import { litService } from './lit'
import { storageService } from './storage'

export class ServicesManager {
  private static instance: ServicesManager
  private initialized = false

  private constructor() {}

  static getInstance(): ServicesManager {
    if (!ServicesManager.instance) {
      ServicesManager.instance = new ServicesManager()
    }
    return ServicesManager.instance
  }

  /**
   * Initialize all core services
   */
  async initializeAll(): Promise<{ success: boolean; results: Record<string, boolean> }> {
    const results: Record<string, boolean> = {}

    try {
      // Initialize services in parallel for better performance
      const [privyResult, easResult, litResult, storageResult] = await Promise.allSettled([
        privyService.initialize(),
        easService.initialize(),
        litService.initialize(),
        storageService.initialize(),
      ])

      results.privy = privyResult.status === 'fulfilled' ? privyResult.value : false
      results.eas = easResult.status === 'fulfilled' ? easResult.value : false
      results.lit = litResult.status === 'fulfilled' ? litResult.value : false
      results.storage = storageResult.status === 'fulfilled' ? storageResult.value : false

      // Log any failed initializations
      Object.entries(results).forEach(([service, success]) => {
        if (!success) {
          console.error(`Failed to initialize ${service} service`)
        }
      })

      const allSuccessful = Object.values(results).every(result => result === true)
      this.initialized = allSuccessful

      return { success: allSuccessful, results }
    } catch (error) {
      console.error('Services initialization failed:', error)
      return { success: false, results }
    }
  }

  /**
   * Get comprehensive health check for all services
   */
  async getHealthCheck() {
    const healthChecks = await Promise.allSettled([
      Promise.resolve(privyService.getStatus()),
      Promise.resolve(easService.getStatus()),
      Promise.resolve(litService.getStatus()),
      storageService.getStatus(),
    ])

    const results = {
      privy: healthChecks[0].status === 'fulfilled' ? healthChecks[0].value : { error: 'Health check failed' },
      eas: healthChecks[1].status === 'fulfilled' ? healthChecks[1].value : { error: 'Health check failed' },
      lit: healthChecks[2].status === 'fulfilled' ? healthChecks[2].value : { error: 'Health check failed' },
      storage: healthChecks[3].status === 'fulfilled' ? healthChecks[3].value : { error: 'Health check failed' },
    }

    // Calculate overall health
    const allHealthy = Object.values(results).every(result => 
      !result.hasOwnProperty('error') && 
      result.initialized && 
      result.configured
    )

    return {
      overall: {
        healthy: allHealthy,
        initialized: this.initialized,
        timestamp: new Date().toISOString(),
      },
      services: results
    }
  }

  /**
   * Get individual service instances
   */
  getServices() {
    return {
      privy: privyService,
      eas: easService,
      lit: litService,
      storage: storageService,
    }
  }

  /**
   * Check if all services are initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Cleanup and disconnect all services
   */
  async cleanup(): Promise<void> {
    try {
      await litService.disconnect()
      this.initialized = false
    } catch (error) {
      console.error('Services cleanup failed:', error)
    }
  }
}

// Export singleton instance and individual services
export const servicesManager = ServicesManager.getInstance()
export { privyService, easService, litService, storageService }

// Export service types
export type { ServicesConfig, PrivyConfig, EASConfig, LitConfig, StorageConfig } from '../config/services' 