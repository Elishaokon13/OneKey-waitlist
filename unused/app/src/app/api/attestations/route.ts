/**
 * Attestations API Endpoint
 * Manages attestation references (no PII stored)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth'
import { databaseService } from '@/lib/database'
import { z } from 'zod'

// Validation schemas
const createAttestationSchema = z.object({
  attestationUID: z.string().min(1, 'Attestation UID is required'),
  schemaUID: z.string().min(1, 'Schema UID is required'),
  provider: z.string().min(1, 'Provider is required'),
  status: z.enum(['PENDING', 'VERIFIED', 'FAILED', 'EXPIRED', 'REVOKED']),
  dataHash: z.string().min(1, 'Data hash is required'),
  storageHash: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
})

/**
 * GET /api/attestations
 * List user's attestations
 */
async function handleGet(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const provider = searchParams.get('provider')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      userId: request.user.id,
    }

    if (status) {
      where.status = status
    }

    if (provider) {
      where.provider = provider
    }

    // Get attestations with pagination
    const [attestations, total] = await Promise.all([
      databaseService.getClient().attestationReference.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 100), // Max 100 per request
        skip: offset,
      }),
      databaseService.getClient().attestationReference.count({ where }),
    ])

    return NextResponse.json({
      attestations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Failed to get attestations:', error)
    return NextResponse.json(
      { error: 'Failed to get attestations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/attestations
 * Create new attestation reference
 */
async function handlePost(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAttestationSchema.parse(body)

    // Check if attestation UID already exists
    const existingAttestation = await databaseService.getClient().attestationReference.findUnique({
      where: { attestationUID: validatedData.attestationUID },
    })

    if (existingAttestation) {
      return NextResponse.json(
        { error: 'Attestation UID already exists' },
        { status: 409 }
      )
    }

    // Create attestation reference
    const attestation = await databaseService.getClient().attestationReference.create({
      data: {
        userId: request.user.id,
        attestationUID: validatedData.attestationUID,
        schemaUID: validatedData.schemaUID,
        provider: validatedData.provider,
        status: validatedData.status,
        dataHash: validatedData.dataHash,
        storageHash: validatedData.storageHash,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      },
    })

    // Create audit log
    await databaseService.createAuditLog({
      userId: request.user.id,
      action: 'attestation_created',
      resource: attestation.id,
      metadata: {
        attestationUID: validatedData.attestationUID,
        provider: validatedData.provider,
        status: validatedData.status,
      },
    })

    return NextResponse.json(attestation, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create attestation:', error)
    return NextResponse.json(
      { error: 'Failed to create attestation' },
      { status: 500 }
    )
  }
}

// Export handlers with authentication
export const GET = withAuth(handleGet)
export const POST = withAuth(handlePost) 