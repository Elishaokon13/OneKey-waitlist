/**
 * Jest Setup for Database Tests (Node Environment)
 * This setup file is specifically for database tests running in Node environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./test.db'

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  // Suppress Prisma warnings and non-critical errors during tests
  console.error = (...args) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      (message.includes('Prisma') || 
       message.includes('Database connection') ||
       message.includes('Failed to'))
    ) {
      // Only show critical errors
      if (message.includes('CRITICAL') || message.includes('FATAL')) {
        originalConsoleError(...args)
      }
      return
    }
    originalConsoleError(...args)
  }

  console.warn = (...args) => {
    const message = args[0]
    if (typeof message === 'string' && message.includes('Prisma')) {
      return
    }
    originalConsoleWarn(...args)
  }
})

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
}) 