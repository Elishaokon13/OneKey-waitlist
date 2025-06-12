/**
 * Verification Service Tests
 * Comprehensive test suite for the identity verification system
 */

import { verificationService } from '@/lib/verification/verification-service'
import { unifiedAuthManager } from '@/lib/auth/unified-auth'
import { databaseService } from '@/lib/database'
import type {
  VerificationLevel,
  VerificationStatus,
  DocumentType,
  VerificationError,
  DocumentVerificationError,
  BiometricVerificationError,
} from '@/lib/verification/types'

// Mock dependencies
jest.mock('@/lib/auth/unified-auth')
jest.mock('@/lib/database')

const mockUnifiedAuthManager = unifiedAuthManager as jest.Mocked<typeof unifiedAuthManager>
const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>

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
    
    // Setup default mocks
    mockUnifiedAuthManager.getCurrentUser.mockReturnValue(mockUser)
    mockUnifiedAuthManager.getCurrentMethod.mockReturnValue('privy')
    mockDatabaseService.createAuditLog.mockResolvedValue({
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
      
      expect(config?.levels[VerificationLevel.NONE]).toBeDefined()
      expect(config?.levels[VerificationLevel.BASIC]).toBeDefined()
      expect(config?.levels[VerificationLevel.STANDARD]).toBeDefined()
      expect(config?.levels[VerificationLevel.ENHANCED]).toBeDefined()
      expect(config?.levels[VerificationLevel.PREMIUM]).toBeDefined()
    })

    it('should have document configurations for all document types', () => {
      const config = verificationService.getConfiguration()
      
      expect(config?.documents[DocumentType.PASSPORT]).toBeDefined()
      expect(config?.documents[DocumentType.DRIVERS_LICENSE]).toBeDefined()
      expect(config?.documents[DocumentType.NATIONAL_ID]).toBeDefined()
      expect(config?.documents[DocumentType.UTILITY_BILL]).toBeDefined()
    })
  })

  describe('Session Management', () => {
    it('should start verification session successfully', async () => {
      const session = await verificationService.startVerification(VerificationLevel.BASIC)
      
      expect(session).toBeDefined()
      expect(session.id).toBeDefined()
      expect(session.userId).toBe(mockUser.id)
      expect(session.level).toBe(VerificationLevel.BASIC)
      expect(session.status).toBe(VerificationStatus.IN_PROGRESS)
      expect(session.steps).toBeDefined()
      expect(session.steps.length).toBeGreaterThan(0)
    })

    it('should throw error when user not authenticated', async () => {
      mockUnifiedAuthManager.getCurrentUser.mockReturnValue(null)
      
      await expect(verificationService.startVerification(VerificationLevel.BASIC))
        .rejects.toThrow('User not authenticated')
    })

    it('should return existing active session', async () => {
      // Start first session
      const session1 = await verificationService.startVerification(VerificationLevel.BASIC)
      
      // Try to start another session
      const session2 = await verificationService.startVerification(VerificationLevel.BASIC)
      
      expect(session1.id).toBe(session2.id)
    })

    it('should generate correct steps for different verification levels', async () => {
      const basicSession = await verificationService.startVerification(VerificationLevel.BASIC)
      const standardSession = await verificationService.startVerification(VerificationLevel.STANDARD)
      
      expect(basicSession.steps.length).toBeLessThan(standardSession.steps.length)
      
      const basicStepTypes = basicSession.steps.map(step => step.type)
      expect(basicStepTypes).toContain('email_verification')
      expect(basicStepTypes).toContain('phone_verification')
      
      const standardStepTypes = standardSession.steps.map(step => step.type)
      expect(standardStepTypes).toContain('document_upload')
      expect(standardStepTypes).toContain('address_verification')
    })

    it('should create audit log when starting session', async () => {
      await verificationService.startVerification(VerificationLevel.BASIC)
      
      expect(mockDatabaseService.createAuditLog).toHaveBeenCalledWith({
        userId: mockUser.id,
        action: 'verification_started',
        details: expect.objectContaining({
          level: VerificationLevel.BASIC,
          authMethod: 'privy',
        }),
      })
    })
  })

  describe('Step Completion', () => {
    let session: any

    beforeEach(async () => {
      session = await verificationService.startVerification(VerificationLevel.BASIC)
    })

    it('should complete step successfully', async () => {
      const currentStep = session.steps[0]
      const stepData = { email: 'test@example.com' }
      
      const completedStep = await verificationService.completeStep(
        session.id, 
        currentStep.id, 
        stepData
      )
      
      expect(completedStep.status).toBe(VerificationStatus.APPROVED)
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

    it('should throw error when step already completed', async () => {
      const currentStep = session.steps[0]
      
      // Complete step first time
      await verificationService.completeStep(session.id, currentStep.id)
      
      // Try to complete again
      await expect(verificationService.completeStep(session.id, currentStep.id))
        .rejects.toThrow('Step already completed')
    })

    it('should progress to next step after completion', async () => {
      const firstStep = session.steps[0]
      const secondStep = session.steps[1]
      
      await verificationService.completeStep(session.id, firstStep.id)
      
      const updatedSession = verificationService.getSession(session.id)
      expect(updatedSession?.currentStep).toBe(secondStep.id)
      expect(updatedSession?.steps[1].status).toBe(VerificationStatus.IN_PROGRESS)
    })

    it('should mark session as pending review when all steps completed', async () => {
      // Complete all required steps
      for (const step of session.steps.filter((s: any) => s.required)) {
        await verificationService.completeStep(session.id, step.id)
      }
      
      const updatedSession = verificationService.getSession(session.id)
      expect(updatedSession?.status).toBe(VerificationStatus.PENDING_REVIEW)
      expect(updatedSession?.completedAt).toBeDefined()
    })

    it('should create audit log when completing step', async () => {
      const currentStep = session.steps[0]
      const stepData = { email: 'test@example.com' }
      
      await verificationService.completeStep(session.id, currentStep.id, stepData)
      
      expect(mockDatabaseService.createAuditLog).toHaveBeenCalledWith({
        userId: mockUser.id,
        action: 'verification_step_completed',
        details: expect.objectContaining({
          sessionId: session.id,
          stepId: currentStep.id,
          stepType: currentStep.type,
          data: stepData,
        }),
      })
    })
  })

  describe('Document Upload', () => {
    let session: any

    beforeEach(async () => {
      session = await verificationService.startVerification(VerificationLevel.STANDARD)
    })

    it('should upload document successfully', async () => {
      const file = new File(['test content'], 'passport.jpg', { type: 'image/jpeg' })
      
      const document = await verificationService.uploadDocument(
        session.id,
        DocumentType.PASSPORT,
        file
      )
      
      expect(document).toBeDefined()
      expect(document.id).toBeDefined()
      expect(document.userId).toBe(mockUser.id)
      expect(document.type).toBe(DocumentType.PASSPORT)
      expect(document.fileName).toBe('passport.jpg')
      expect(document.mimeType).toBe('image/jpeg')
      expect(document.status).toBe('processing')
    })

    it('should throw error for invalid session', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      await expect(verificationService.uploadDocument('invalid-session', DocumentType.PASSPORT, file))
        .rejects.toThrow('Session not found')
    })

    it('should validate file format', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      await expect(verificationService.uploadDocument(session.id, DocumentType.PASSPORT, file))
        .rejects.toThrow(DocumentVerificationError)
    })

    it('should validate file size', async () => {
      // Create a file larger than 10MB
      const largeContent = 'x'.repeat(11 * 1024 * 1024)
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
      
      await expect(verificationService.uploadDocument(session.id, DocumentType.PASSPORT, file))
        .rejects.toThrow(DocumentVerificationError)
    })

    it('should add document to session', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      await verificationService.uploadDocument(session.id, DocumentType.PASSPORT, file)
      
      const updatedSession = verificationService.getSession(session.id)
      expect(updatedSession?.documents).toHaveLength(1)
      expect(updatedSession?.documents[0].type).toBe(DocumentType.PASSPORT)
    })

    it('should create audit log when uploading document', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      await verificationService.uploadDocument(session.id, DocumentType.PASSPORT, file)
      
      expect(mockDatabaseService.createAuditLog).toHaveBeenCalledWith({
        userId: mockUser.id,
        action: 'document_uploaded',
        details: expect.objectContaining({
          sessionId: session.id,
          type: DocumentType.PASSPORT,
          fileName: 'passport.jpg',
        }),
      })
    })
  })

  describe('Biometric Submission', () => {
    let session: any

    beforeEach(async () => {
      session = await verificationService.startVerification(VerificationLevel.ENHANCED)
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

    it('should create audit log when submitting biometric', async () => {
      const biometricData = { faceImage: 'base64-encoded-image' }
      
      await verificationService.submitBiometric(session.id, 'facial_recognition', biometricData)
      
      expect(mockDatabaseService.createAuditLog).toHaveBeenCalledWith({
        userId: mockUser.id,
        action: 'biometric_submitted',
        details: expect.objectContaining({
          sessionId: session.id,
          type: 'facial_recognition',
        }),
      })
    })
  })

  describe('Session Retrieval', () => {
    it('should get session by ID', async () => {
      const session = await verificationService.startVerification(VerificationLevel.BASIC)
      
      const retrievedSession = verificationService.getSession(session.id)
      
      expect(retrievedSession).toBeDefined()
      expect(retrievedSession?.id).toBe(session.id)
    })

    it('should return null for invalid session ID', () => {
      const session = verificationService.getSession('invalid-session')
      
      expect(session).toBeNull()
    })

    it('should get active session for user', async () => {
      const session = await verificationService.startVerification(VerificationLevel.BASIC)
      
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
    it('should handle VerificationError properly', async () => {
      mockUnifiedAuthManager.getCurrentUser.mockReturnValue(null)
      
      await expect(verificationService.startVerification(VerificationLevel.BASIC))
        .rejects.toThrow(VerificationError)
    })

    it('should handle DocumentVerificationError properly', async () => {
      const session = await verificationService.startVerification(VerificationLevel.STANDARD)
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      await expect(verificationService.uploadDocument(session.id, DocumentType.PASSPORT, file))
        .rejects.toThrow(DocumentVerificationError)
    })

    it('should handle BiometricVerificationError properly', async () => {
      // This would be triggered by processing failures in a real implementation
      // For now, we're testing the structure is in place
      expect(BiometricVerificationError).toBeDefined()
    })
  })

  describe('Document Processing Simulation', () => {
    let session: any

    beforeEach(async () => {
      session = await verificationService.startVerification(VerificationLevel.STANDARD)
    })

    it('should process document with simulated OCR results', async () => {
      const file = new File(['test'], 'passport.jpg', { type: 'image/jpeg' })
      
      const document = await verificationService.uploadDocument(session.id, DocumentType.PASSPORT, file)
      
      // Wait for processing simulation
      await new Promise(resolve => setTimeout(resolve, 2100))
      
      const updatedSession = verificationService.getSession(session.id)
      const processedDocument = updatedSession?.documents[0]
      
      expect(processedDocument?.extractedData).toBeDefined()
      expect(processedDocument?.confidence).toBeGreaterThan(0)
      expect(['verified', 'rejected']).toContain(processedDocument?.status)
    })
  })

  describe('Biometric Processing Simulation', () => {
    let session: any

    beforeEach(async () => {
      session = await verificationService.startVerification(VerificationLevel.ENHANCED)
    })

    it('should process biometric with simulated AI results', async () => {
      const biometricData = { faceImage: 'base64-encoded-image' }
      
      const biometric = await verificationService.submitBiometric(
        session.id,
        'facial_recognition',
        biometricData
      )
      
      // Wait for processing simulation
      await new Promise(resolve => setTimeout(resolve, 3100))
      
      const updatedSession = verificationService.getSession(session.id)
      const processedBiometric = updatedSession?.biometrics[0]
      
      expect(processedBiometric?.confidence).toBeGreaterThan(0)
      expect(processedBiometric?.matchScore).toBeDefined()
      expect(processedBiometric?.livenessScore).toBeDefined()
      expect(['verified', 'rejected']).toContain(processedBiometric?.status)
    })
  })
}) 