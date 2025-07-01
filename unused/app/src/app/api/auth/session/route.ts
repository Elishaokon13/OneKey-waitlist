/**
 * Authentication Session API Endpoint
 * Manages user authentication sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth'
import { createUserSession, revokeUserSession } from '@/lib/middleware/auth'
import { databaseService } from '@/lib/database'
import { z } from 'zod'

// Validation schemas
const createSessionSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  privyUserId: z.string().optional(),
})

const revokeSessionSchema = z.object({
  sessionToken: z.string().min(1, 'Session token is required'),
})

/**
 * GET /api/auth/session
 * Get current session information
 */
async function handleGet(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get session information
    const session = await databaseService.getClient().session.findFirst({
      where: { userId: request.user.id },
      orderBy: { createdAt: 'desc' },
    })

    if (!session) {
      return NextResponse.json({ error: 'No active session found' }, { status: 404 })
    }

    return NextResponse.json({
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      user: {
        id: request.user.id,
        walletAddress: request.user.walletAddress,
        privyUserId: request.user.privyUserId,
      },
    })
  } catch (error) {
    console.error('Failed to get session:', error)
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/auth/session
 * Create new authentication session
 */
async function handlePost(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createSessionSchema.parse(body)

    // Create session
    const sessionData = await createUserSession(
      validatedData.walletAddress,
      validatedData.privyUserId
    )

    return NextResponse.json({
      sessionToken: sessionData.sessionToken,
      expiresAt: sessionData.expiresAt,
      message: 'Session created successfully',
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/auth/session
 * Revoke authentication session
 */
async function handleDelete(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = revokeSessionSchema.parse(body)

    // Revoke session
    const success = await revokeUserSession(validatedData.sessionToken)

    if (!success) {
      return NextResponse.json(
        { error: 'Session not found or already revoked' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Session revoked successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to revoke session:', error)
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    )
  }
}

// Export handlers
export const GET = withAuth(handleGet)
export const POST = handlePost // No auth required for creating sessions
export const DELETE = handleDelete // No auth required for revoking sessions 