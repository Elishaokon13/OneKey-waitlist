/**
 * Complete Verification Step API Route
 * POST /api/verification/step
 */

import { NextRequest, NextResponse } from 'next/server'
import { verificationService } from '@/lib/verification/verification-service'
import { authMiddleware } from '@/lib/auth/middleware'
import type { 
  CompleteStepRequest, 
  CompleteStepResponse 
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
    const body: CompleteStepRequest = await request.json()
    const { stepId, data, metadata } = body

    // Validate step ID
    if (!stepId) {
      return NextResponse.json(
        { error: 'Step ID is required' },
        { status: 400 }
      )
    }

    // Extract session ID from step ID (assuming format: step_1_email_verification)
    const sessionId = request.headers.get('x-session-id')
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Complete the step
    const completedStep = await verificationService.completeStep(sessionId, stepId, data)
    
    // Get updated session
    const session = verificationService.getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Find next step
    const nextStep = session.steps.find(step => 
      step.status === 'in_progress' || step.status === 'not_started'
    )

    const response: CompleteStepResponse = {
      step: completedStep,
      nextStep,
      session,
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Complete step error:', error)
    
    // Handle specific verification errors
    if (error instanceof Error) {
      if (error.message.includes('Session not found')) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('Step not found')) {
        return NextResponse.json(
          { error: 'Step not found' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('Step already completed')) {
        return NextResponse.json(
          { error: 'Step already completed' },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to complete step',
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-session-id',
    },
  })
} 