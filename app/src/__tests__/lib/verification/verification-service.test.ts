/**
 * Verification Service Tests
 * Comprehensive test suite for the identity verification system
 */

// Mock all dependencies BEFORE importing anything
jest.mock('@/lib/auth/unified-auth', () => ({
  unifiedAuthManager: {
    getCurrentUser: jest.fn(),
    getCurrentMethod: jest.fn(),
  },
}))

jest.mock('@/lib/database', () => ({
  databaseService: {
    createAuditLog: jest.fn(),
  },
}))

// Import types
import type {
  VerificationLevel,
  VerificationStatus,
  DocumentType,
} from '@/lib/verification/types'

// Import the verification service after mocks are set up
const { verificationService } = require('@/lib/verification/verification-service')
const { unifiedAuthManager } = require('@/lib/auth/unified-auth')
const { databaseService } = require('@/lib/database')

// Import error classes
const { VerificationError, DocumentVerificationError, BiometricVerificationError } = require('@/lib/verification/types')

describe('VerificationService', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    walletAddress: '0x123...',
    createdAt: new Date(),
    lastLoginAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Clear verification service state between tests
    const service = verificationService as any
    if (service.sessions) {
      service.sessions.clear()
    }
    
    // Setup default mocks
    unifiedAuthManager.getCurrentUser.mockReturnValue(mockUser)
    unifiedAuthManager.getCurrentMethod.mockReturnValue('privy')
    databaseService.createAuditLog.mockResolvedValue({
      id: 'audit-123',
      userId: mockUser.id,
      action: 'test',
      details: {},
      timestamp: new Date(),
      ipAddress: null,
      userAgent: null,
    })
  })

  describe('Configuration Management', () => {
    it('should load default configuration successfully', () => {
      const config = verificationService.getConfiguration()
      
      expect(config).toBeDefined()
      expect(config?.levels).toBeDefined()
      expect(config?.documents).toBeDefined()
      expect(config?.riskThresholds).toBeDefined()
    })

    it('should have all verification levels configured', () => {
      const config = verificationService.getConfiguration()
      
      expect(config?.levels[0]).toBeDefined() // NONE
      expect(config?.levels[1]).toBeDefined() // BASIC
      expect(config?.levels[2]).toBeDefined() // STANDARD
      expect(config?.levels[3]).toBeDefined() // ENHANCED
      expect(config?.levels[4]).toBeDefined() // PREMIUM
    })

    it('should have document configurations for document types', () => {
      const config = verificationService.getConfiguration()
      
      expect(config?.documents).toBeDefined()
      expect(Object.keys(config?.documents || {})).toContain('passport')
      expect(Object.keys(config?.documents || {})).toContain('drivers_license')
      expect(Object.keys(config?.documents || {})).toContain('national_id')
    })
  })

  describe('Session Management', () => {
    it('should start verification session successfully', async () => {
      const session = await verificationService.startVerification(1) // BASIC
      
      expect(session).toBeDefined()
      expect(session.id).toBeDefined()
      expect(session.userId).toBe(mockUser.id)
      expect(session.level).toBe(1)
      expect(session.status).toBe('in_progress')
      expect(session.steps).toBeDefined()
      expect(session.steps.length).toBeGreaterThan(0)
    })

    it('should throw error when user not authenticated', async () => {
      unifiedAuthManager.getCurrentUser.mockReturnValue(null)
      
      await expect(verificationService.startVerification(1))
        .rejects.toThrow('User not authenticated')
    })

    it('should return existing active session', async () => {
      // Start first session
      const session1 = await verificationService.startVerification(1)
      
      // Try to start another session
      const session2 = await verificationService.startVerification(1)
      
      expect(session1.id).toBe(session2.id)
    })

    it('should generate correct steps for different verification levels', async () => {
      const basicSession = await verificationService.startVerification(1) // BASIC
      
      const basicStepTypes = basicSession.steps.map((step: any) => step.type)
      expect(basicStepTypes).toContain('email_verification')
      expect(basicStepTypes).toContain('phone_verification')
    })

    it('should create audit log when starting session', async () => {
      await verificationService.startVerification(1)
      
      // Give some time for async operations
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(databaseService.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        userId: mockUser.id,
        action: 'verification_started',
        details: expect.objectContaining({
          level: 1,
          authMethod: 'privy',
        }),
      }))
    })
  })

  describe('Step Completion', () => {
    let session: any

    beforeEach(async () => {
      session = await verificationService.startVerification(1) // BASIC
    })

    it('should complete step successfully', async () => {
      const currentStep = session.steps[0]
      const stepData = { email: 'test@example.com' }
      
      const completedStep = await verificationService.completeStep(
        session.id, 
        currentStep.id, 
        stepData
      )
      
      expect(completedStep.status).toBe('approved')
      expect(completedStep.completedAt).toBeDefined()
      expect(completedStep.metadata).toMatchObject(stepData)
    })

    it('should throw error for invalid session', async () => {
      await expect(verificationService.completeStep('invalid-session', 'step-1'))
        .rejects.toThrow('Session not found')
    })

    it('should throw error for invalid step', async () => {
      await expect(verificationService.completeStep(session.id, 'invalid-step'))
        .rejects.toThrow('Step not found')
    })

    it('should progress to next step after completion', async () => {
      const firstStep = session.steps[0]
      const secondStep = session.steps[1]
      
      await verificationService.completeStep(session.id, firstStep.id)
      
      const updatedSession = verificationService.getSession(session.id)
      expect(updatedSession?.currentStep).toBe(secondStep.id)
      expect(updatedSession?.steps[1].status).toBe('in_progress')
    })

    it('should mark session as pending review when all steps completed', async () => {
      // Complete all required steps
      for (const step of session.steps.filter((s: any) => s.required)) {
        await verificationService.completeStep(session.id, step.id)
      }
      
      const updatedSession = verificationService.getSession(session.id)
      expect(updatedSession?.status).toBe('pending_review')
      expect(updatedSession?.completedAt).toBeDefined()
    })
  })

  describe('Document Upload', () => {
    let session: any

    beforeEach(async () => {
      session = await verificationService.startVerification(2) // STANDARD
    })

    it('should upload document successfully', async () => {
      const file = new File(['test content'], 'passport.jpg', { type: 'image/jpeg' })
      
      const document = await verificationService.uploadDocument(
        session.id,
        'passport',
        file
      )
      
      expect(document).toBeDefined()
      expect(document.id).toBeDefined()
      expect(document.userId).toBe(mockUser.id)
      expect(document.type).toBe('passport')
      expect(document.fileName).toBe('passport.jpg')
      expect(document.mimeType).toBe('image/jpeg')
      expect(document.status).toBe('processing')
    })

    it('should throw error for invalid session', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      await expect(verificationService.uploadDocument('invalid-session', 'passport', file))
        .rejects.toThrow('Session not found')
    })

    it('should validate file format', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      await expect(verificationService.uploadDocument(session.id, 'passport', file))
        .rejects.toThrow()
    })

    it('should add document to session', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      await verificationService.uploadDocument(session.id, 'passport', file)
      
      const updatedSession = verificationService.getSession(session.id)
      expect(updatedSession?.documents).toHaveLength(1)
      expect(updatedSession?.documents[0].type).toBe('passport')
    })
  })

  describe('Biometric Submission', () => {
    let session: any

    beforeEach(async () => {
      session = await verificationService.startVerification(3) // ENHANCED
    })

    it('should submit biometric data successfully', async () => {
      const biometricData = { faceImage: 'base64-encoded-image' }
      
      const biometric = await verificationService.submitBiometric(
        session.id,
        'facial_recognition',
        biometricData
      )
      
      expect(biometric).toBeDefined()
      expect(biometric.id).toBeDefined()
      expect(biometric.userId).toBe(mockUser.id)
      expect(biometric.type).toBe('facial_recognition')
      expect(biometric.status).toBe('processing')
      expect(biometric.confidence).toBe(0) // Initial confidence
    })

    it('should throw error for invalid session', async () => {
      await expect(verificationService.submitBiometric('invalid-session', 'facial_recognition', {}))
        .rejects.toThrow('Session not found')
    })

    it('should add biometric to session', async () => {
      const biometricData = { faceImage: 'base64-encoded-image' }
      
      await verificationService.submitBiometric(session.id, 'facial_recognition', biometricData)
      
      const updatedSession = verificationService.getSession(session.id)
      expect(updatedSession?.biometrics).toHaveLength(1)
      expect(updatedSession?.biometrics[0].type).toBe('facial_recognition')
    })
  })

  describe('Session Retrieval', () => {
    it('should get session by ID', async () => {
      const session = await verificationService.startVerification(1)
      
      const retrievedSession = verificationService.getSession(session.id)
      
      expect(retrievedSession).toBeDefined()
      expect(retrievedSession?.id).toBe(session.id)
    })

    it('should return null for invalid session ID', () => {
      const session = verificationService.getSession('invalid-session')
      
      expect(session).toBeNull()
    })

    it('should get active session for user', async () => {
      const session = await verificationService.startVerification(1)
      
      const activeSession = await verificationService.getActiveSession(mockUser.id)
      
      expect(activeSession).toBeDefined()
      expect(activeSession?.id).toBe(session.id)
    })

    it('should return null when no active session exists', async () => {
      const activeSession = await verificationService.getActiveSession('different-user')
      
      expect(activeSession).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      unifiedAuthManager.getCurrentUser.mockReturnValue(null)
      
      await expect(verificationService.startVerification(1))
        .rejects.toThrow('User not authenticated')
    })

    it('should handle invalid document types', async () => {
      const session = await verificationService.startVerification(2)
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      await expect(verificationService.uploadDocument(session.id, 'passport', file))
        .rejects.toThrow()
    })
  })

  describe('Processing Simulation', () => {
    it('should simulate document processing', async () => {
      const session = await verificationService.startVerification(2)
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const document = await verificationService.uploadDocument(session.id, 'passport', file)
      
      expect(document.status).toBe('processing')
      
      // In a real test, you might wait for the async processing
      // For now, we just verify the initial state
    }, 10000)

    it('should simulate biometric processing', async () => {
      const session = await verificationService.startVerification(3)
      const biometricData = { faceImage: 'base64-encoded-image' }
      
      const biometric = await verificationService.submitBiometric(
        session.id,
        'facial_recognition',
        biometricData
      )
      
      expect(biometric.status).toBe('processing')
      expect(biometric.confidence).toBe(0)
    }, 10000)
  })
}) 