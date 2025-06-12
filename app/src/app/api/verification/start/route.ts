/**
 * Start Verification API Route
 * POST /api/verification/start
 */

import { NextRequest, NextResponse } from 'next/server'
import { verificationService } from '@/lib/verification/verification-service'
import { authMiddleware } from '@/lib/auth/middleware'
import type { 
  StartVerificationRequest, 
  StartVerificationResponse,
  VerificationLevel 
} from '@/lib/verification/types'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: StartVerificationRequest = await request.json()
    const { level, authMethod, metadata } = body

    // Validate verification level
    if (!Object.values(VerificationLevel).includes(level)) {
      return NextResponse.json(
        { error: 'Invalid verification level' },
        { status: 400 }
      )
    }

    // Start verification session
    const session = await verificationService.startVerification(level)
    
    // Get next step
    const nextStep = session.steps.find(step => step.id === session.currentStep)
    if (!nextStep) {
      return NextResponse.json(
        { error: 'Failed to determine next step' },
        { status: 500 }
      )
    }

    // Calculate estimated time
    const estimatedTime = session.steps
      .filter(step => step.required)
      .reduce((total, step) => total + step.estimatedTime, 0)

    const response: StartVerificationResponse = {
      session,
      nextStep,
      estimatedTime,
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Start verification error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to start verification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 