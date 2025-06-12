/**
 * Authentication Middleware
 * Validates user sessions and provides user context for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    walletAddress: string
    privyUserId?: string
  }
}

/**
 * Extract user information from request headers or session
 */
async function extractUserFromRequest(request: NextRequest): Promise<{
  id: string
  walletAddress: string
  privyUserId?: string
} | null> {
  try {
    // Try to get user from Authorization header (Bearer token)
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      // Look up session by token
      const session = await databaseService.getClient().session.findUnique({
        where: { sessionToken: token },
        include: { user: true },
      })

      if (session && session.expiresAt > new Date()) {
        return {
          id: session.user.id,
          walletAddress: session.user.walletAddress,
          privyUserId: session.user.privyUserId || undefined,
        }
      }
    }

    // Try to get user from wallet address header (for development/testing)
    const walletAddress = request.headers.get('x-wallet-address')
    if (walletAddress) {
      const user = await databaseService.getClient().user.findUnique({
        where: { walletAddress },
      })

      if (user) {
        return {
          id: user.id,
          walletAddress: user.walletAddress,
          privyUserId: user.privyUserId || undefined,
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error extracting user from request:', error)
    return null
  }
}

/**
 * Authentication middleware for API routes
 */
export async function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options: { required?: boolean } = { required: true }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Extract user from request
      const user = await extractUserFromRequest(request)

      // Check if authentication is required
      if (options.required && !user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Add user to request object
      const authenticatedRequest = request as AuthenticatedRequest
      if (user) {
        authenticatedRequest.user = user
      }

      // Create audit log for authenticated requests
      if (user) {
        await databaseService.createAuditLog({
          userId: user.id,
          action: `api_${request.method?.toLowerCase()}_${request.nextUrl.pathname}`,
          metadata: {
            method: request.method,
            path: request.nextUrl.pathname,
            userAgent: request.headers.get('user-agent'),
          },
          ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || undefined,
        })
      }

      // Call the actual handler
      return await handler(authenticatedRequest)
    } catch (error) {
      console.error('Authentication middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Create or update user session
 */
export async function createUserSession(
  walletAddress: string,
  privyUserId?: string
): Promise<{ sessionToken: string; expiresAt: Date }> {
  try {
    // Find or create user
    const user = await databaseService.getClient().user.upsert({
      where: { walletAddress },
      update: { 
        privyUserId: privyUserId || undefined,
        updatedAt: new Date(),
      },
      create: {
        walletAddress,
        privyUserId: privyUserId || undefined,
      },
    })

    // Create session (expires in 24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const sessionToken = generateSessionToken()

    const session = await databaseService.getClient().session.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt,
      },
    })

    // Create audit log
    await databaseService.createAuditLog({
      userId: user.id,
      action: 'session_created',
      metadata: { privyUserId },
    })

    return {
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt,
    }
  } catch (error) {
    console.error('Failed to create user session:', error)
    throw error
  }
}

/**
 * Revoke user session
 */
export async function revokeUserSession(sessionToken: string): Promise<boolean> {
  try {
    const session = await databaseService.getClient().session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })

    if (session) {
      await databaseService.getClient().session.delete({
        where: { sessionToken },
      })

      // Create audit log
      await databaseService.createAuditLog({
        userId: session.user.id,
        action: 'session_revoked',
      })

      return true
    }

    return false
  } catch (error) {
    console.error('Failed to revoke user session:', error)
    return false
  }
}

/**
 * Generate secure session token
 */
function generateSessionToken(): string {
  // Generate a secure random token
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Validate request rate limiting (basic implementation)
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): Promise<boolean> {
  // This is a basic in-memory rate limiter
  // In production, you'd want to use Redis or similar
  const now = Date.now()
  const key = `rate_limit_${identifier}`
  
  // For now, just return true (no rate limiting)
  // TODO: Implement proper rate limiting in production
  return true
} 