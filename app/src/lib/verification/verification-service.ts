/**
 * Verification Service
 * Core service for managing KYC verification workflows
 */

import { databaseService } from '@/lib/database'
import { unifiedAuthManager } from '@/lib/auth/unified-auth'
import type {
  VerificationLevel,
  VerificationStatus,
  VerificationSession,
  VerificationStep,
  VerificationStepType,
  DocumentType,
  DocumentUpload,
  DocumentData,
  BiometricData,
  RiskAssessment,
  RiskLevel,
  VerificationConfig,
  VerificationEvent,
  VerificationNotification,
  VerificationError,
  DocumentVerificationError,
  BiometricVerificationError,
} from './types'

export class VerificationService {
  private static instance: VerificationService
  private config: VerificationConfig | null = null
  private sessions: Map<string, VerificationSession> = new Map()

  private constructor() {
    this.loadConfiguration()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService()
    }
    return VerificationService.instance
  }

  /**
   * Load verification configuration
   */
  private async loadConfiguration(): Promise<void> {
    try {
      // Load from database or use default configuration
      this.config = await this.getDefaultConfiguration()
      console.log('Verification configuration loaded successfully')
    } catch (error) {
      console.error('Failed to load verification configuration:', error)
      throw new VerificationError('Failed to load configuration', 'CONFIG_LOAD_FAILED')
    }
  }

  /**
   * Get default verification configuration
   */
  private async getDefaultConfiguration(): Promise<VerificationConfig> {
    return {
      levels: {
        [VerificationLevel.NONE]: {
          name: 'No Verification',
          description: 'No identity verification required',
          requiredSteps: [],
          optionalSteps: [],
          validityPeriod: 0,
          autoApprove: true,
        },
        [VerificationLevel.BASIC]: {
          name: 'Basic Verification',
          description: 'Email and phone verification',
          requiredSteps: ['email_verification', 'phone_verification'],
          optionalSteps: [],
          validityPeriod: 90,
          autoApprove: true,
        },
        [VerificationLevel.STANDARD]: {
          name: 'Standard Verification',
          description: 'Government ID and address verification',
          requiredSteps: ['email_verification', 'phone_verification', 'document_upload', 'address_verification'],
          optionalSteps: ['selfie_verification'],
          validityPeriod: 365,
          autoApprove: false,
        },
        [VerificationLevel.ENHANCED]: {
          name: 'Enhanced Verification',
          description: 'Biometric verification and enhanced screening',
          requiredSteps: ['email_verification', 'phone_verification', 'document_upload', 'selfie_verification', 'liveness_check', 'biometric_verification'],
          optionalSteps: ['enhanced_screening'],
          validityPeriod: 365,
          autoApprove: false,
        },
        [VerificationLevel.PREMIUM]: {
          name: 'Premium Verification',
          description: 'Full KYC with enhanced due diligence',
          requiredSteps: ['email_verification', 'phone_verification', 'document_upload', 'selfie_verification', 'liveness_check', 'biometric_verification', 'enhanced_screening'],
          optionalSteps: ['manual_review'],
          validityPeriod: 365,
          autoApprove: false,
        },
      },
      documents: {
        [DocumentType.PASSPORT]: {
          name: 'Passport',
          description: 'Government-issued passport',
          acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
          maxFileSize: 10 * 1024 * 1024, // 10MB
          required: true,
          level: VerificationLevel.STANDARD,
        },
        [DocumentType.DRIVERS_LICENSE]: {
          name: "Driver's License",
          description: 'Government-issued driving license',
          acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
          maxFileSize: 10 * 1024 * 1024,
          required: true,
          level: VerificationLevel.STANDARD,
        },
        [DocumentType.NATIONAL_ID]: {
          name: 'National ID',
          description: 'Government-issued national identity card',
          acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
          maxFileSize: 10 * 1024 * 1024,
          required: true,
          level: VerificationLevel.STANDARD,
        },
        [DocumentType.STATE_ID]: {
          name: 'State ID',
          description: 'State-issued identification card',
          acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
          maxFileSize: 10 * 1024 * 1024,
          required: true,
          level: VerificationLevel.STANDARD,
        },
        [DocumentType.UTILITY_BILL]: {
          name: 'Utility Bill',
          description: 'Recent utility bill for address verification',
          acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
          maxFileSize: 10 * 1024 * 1024,
          required: false,
          level: VerificationLevel.STANDARD,
        },
        [DocumentType.BANK_STATEMENT]: {
          name: 'Bank Statement',
          description: 'Recent bank statement for address verification',
          acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
          maxFileSize: 10 * 1024 * 1024,
          required: false,
          level: VerificationLevel.STANDARD,
        },
        [DocumentType.LEASE_AGREEMENT]: {
          name: 'Lease Agreement',
          description: 'Rental agreement for address verification',
          acceptedFormats: ['application/pdf'],
          maxFileSize: 10 * 1024 * 1024,
          required: false,
          level: VerificationLevel.STANDARD,
        },
        [DocumentType.GOVERNMENT_CORRESPONDENCE]: {
          name: 'Government Correspondence',
          description: 'Official government mail for address verification',
          acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
          maxFileSize: 10 * 1024 * 1024,
          required: false,
          level: VerificationLevel.STANDARD,
        },
        [DocumentType.TAX_RETURN]: {
          name: 'Tax Return',
          description: 'Recent tax return document',
          acceptedFormats: ['application/pdf'],
          maxFileSize: 10 * 1024 * 1024,
          required: false,
          level: VerificationLevel.ENHANCED,
        },
        [DocumentType.EMPLOYMENT_LETTER]: {
          name: 'Employment Letter',
          description: 'Letter from employer',
          acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
          maxFileSize: 10 * 1024 * 1024,
          required: false,
          level: VerificationLevel.ENHANCED,
        },
        [DocumentType.INCOME_STATEMENT]: {
          name: 'Income Statement',
          description: 'Proof of income document',
          acceptedFormats: ['application/pdf'],
          maxFileSize: 10 * 1024 * 1024,
          required: false,
          level: VerificationLevel.ENHANCED,
        },
        [DocumentType.BUSINESS_REGISTRATION]: {
          name: 'Business Registration',
          description: 'Business registration certificate',
          acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
          maxFileSize: 10 * 1024 * 1024,
          required: false,
          level: VerificationLevel.PREMIUM,
        },
        [DocumentType.ARTICLES_OF_INCORPORATION]: {
          name: 'Articles of Incorporation',
          description: 'Corporate formation documents',
          acceptedFormats: ['application/pdf'],
          maxFileSize: 10 * 1024 * 1024,
          required: false,
          level: VerificationLevel.PREMIUM,
        },
        [DocumentType.OPERATING_AGREEMENT]: {
          name: 'Operating Agreement',
          description: 'LLC operating agreement',
          acceptedFormats: ['application/pdf'],
          maxFileSize: 10 * 1024 * 1024,
          required: false,
          level: VerificationLevel.PREMIUM,
        },
      },
      providers: [],
      riskThresholds: {
        [RiskLevel.LOW]: {
          minScore: 0,
          maxScore: 25,
          autoReject: false,
          requiresManualReview: false,
        },
        [RiskLevel.MEDIUM]: {
          minScore: 26,
          maxScore: 50,
          autoReject: false,
          requiresManualReview: true,
        },
        [RiskLevel.HIGH]: {
          minScore: 51,
          maxScore: 75,
          autoReject: false,
          requiresManualReview: true,
        },
        [RiskLevel.CRITICAL]: {
          minScore: 76,
          maxScore: 100,
          autoReject: true,
          requiresManualReview: true,
        },
      },
    }
  }

  /**
   * Start verification session
   */
  async startVerification(level: VerificationLevel): Promise<VerificationSession> {
    const currentUser = unifiedAuthManager.getCurrentUser()
    if (!currentUser) {
      throw new VerificationError('User not authenticated', 'USER_NOT_AUTHENTICATED')
    }

    if (!this.config) {
      throw new VerificationError('Configuration not loaded', 'CONFIG_NOT_LOADED')
    }

    try {
      // Check for existing active session
      const existingSession = await this.getActiveSession(currentUser.id)
      if (existingSession && existingSession.status === VerificationStatus.IN_PROGRESS) {
        console.log('Returning existing verification session:', existingSession.id)
        return existingSession
      }

      // Create new session
      const sessionId = this.generateSessionId()
      const levelConfig = this.config.levels[level]
      const steps = await this.generateVerificationSteps(level, levelConfig)
      
      const session: VerificationSession = {
        id: sessionId,
        userId: currentUser.id,
        level,
        status: VerificationStatus.IN_PROGRESS,
        authMethod: unifiedAuthManager.getCurrentMethod() || 'privy',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        currentStep: steps[0]?.id,
        steps,
        documents: [],
        biometrics: [],
        metadata: {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          startedFrom: 'web',
        },
      }

      // Store session
      this.sessions.set(sessionId, session)

      // Create initial event
      await this.createEvent({
        sessionId,
        userId: currentUser.id,
        type: 'step_started',
        stepId: steps[0]?.id,
        data: { level, authMethod: session.authMethod },
        triggeredBy: 'user',
        triggeredAt: new Date(),
      })

      // Create audit log
      await databaseService.createAuditLog({
        userId: currentUser.id,
        action: 'verification_started',
        details: {
          sessionId,
          level,
          authMethod: session.authMethod,
        },
      })

      console.log('Verification session started:', sessionId)
      return session

    } catch (error) {
      console.error('Failed to start verification:', error)
      throw new VerificationError('Failed to start verification', 'SESSION_START_FAILED')
    }
  }

  /**
   * Get active verification session for user
   */
  async getActiveSession(userId: string): Promise<VerificationSession | null> {
    try {
      // Check in-memory sessions first
      for (const session of this.sessions.values()) {
        if (session.userId === userId && session.status === VerificationStatus.IN_PROGRESS) {
          return session
        }
      }

      // TODO: Query database for persisted sessions
      // const session = await databaseService.getActiveVerificationSession(userId)
      
      return null
    } catch (error) {
      console.error('Failed to get active session:', error)
      return null
    }
  }

  /**
   * Complete verification step
   */
  async completeStep(sessionId: string, stepId: string, data?: Record<string, any>): Promise<VerificationStep> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new VerificationError('Session not found', 'SESSION_NOT_FOUND')
    }

    const step = session.steps.find(s => s.id === stepId)
    if (!step) {
      throw new VerificationError('Step not found', 'STEP_NOT_FOUND')
    }

    if (step.status === VerificationStatus.APPROVED) {
      throw new VerificationError('Step already completed', 'STEP_ALREADY_COMPLETED')
    }

    try {
      // Update step status
      step.status = VerificationStatus.APPROVED
      step.completedAt = new Date()
      if (data) {
        step.metadata = { ...step.metadata, ...data }
      }

      // Find next step
      const nextStep = this.getNextStep(session)
      if (nextStep) {
        session.currentStep = nextStep.id
        nextStep.status = VerificationStatus.IN_PROGRESS
      } else {
        // All steps completed
        session.status = VerificationStatus.PENDING_REVIEW
        session.completedAt = new Date()
      }

      // Create completion event
      await this.createEvent({
        sessionId,
        userId: session.userId,
        type: 'step_completed',
        stepId,
        data,
        triggeredBy: 'user',
        triggeredAt: new Date(),
      })

      // Create audit log
      await databaseService.createAuditLog({
        userId: session.userId,
        action: 'verification_step_completed',
        details: {
          sessionId,
          stepId,
          stepType: step.type,
          data,
        },
      })

      console.log('Verification step completed:', stepId)
      return step

    } catch (error) {
      console.error('Failed to complete step:', error)
      throw new VerificationError('Failed to complete step', 'STEP_COMPLETION_FAILED')
    }
  }

  /**
   * Upload and process document
   */
  async uploadDocument(sessionId: string, type: DocumentType, file: File): Promise<DocumentUpload> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new VerificationError('Session not found', 'SESSION_NOT_FOUND')
    }

    if (!this.config) {
      throw new VerificationError('Configuration not loaded', 'CONFIG_NOT_LOADED')
    }

    const documentConfig = this.config.documents[type]
    if (!documentConfig) {
      throw new DocumentVerificationError(
        'Document type not supported',
        type,
        'UNSUPPORTED_DOCUMENT_TYPE'
      )
    }

    // Validate file
    if (!documentConfig.acceptedFormats.includes(file.type)) {
      throw new DocumentVerificationError(
        'File format not supported',
        type,
        'INVALID_FILE_FORMAT'
      )
    }

    if (file.size > documentConfig.maxFileSize) {
      throw new DocumentVerificationError(
        'File size too large',
        type,
        'FILE_SIZE_EXCEEDED'
      )
    }

    try {
      const documentId = this.generateDocumentId()
      
      // Create document record
      const document: DocumentUpload = {
        id: documentId,
        userId: session.userId,
        type,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
        status: 'processing',
        metadata: {
          sessionId,
          originalName: file.name,
        },
      }

      // Add to session
      session.documents.push(document)

      // Simulate document processing
      setTimeout(async () => {
        try {
          const processedDocument = await this.processDocument(document, file)
          
          // Update document in session
          const docIndex = session.documents.findIndex(d => d.id === documentId)
          if (docIndex >= 0) {
            session.documents[docIndex] = processedDocument
          }

          // Create processing event
          await this.createEvent({
            sessionId,
            userId: session.userId,
            type: 'document_uploaded',
            data: {
              documentId,
              type,
              status: processedDocument.status,
              confidence: processedDocument.confidence,
            },
            triggeredBy: 'system',
            triggeredAt: new Date(),
          })

        } catch (error) {
          console.error('Document processing failed:', error)
          document.status = 'rejected'
          document.rejectionReason = 'Processing failed'
        }
      }, 2000) // Simulate 2-second processing delay

      // Create audit log
      await databaseService.createAuditLog({
        userId: session.userId,
        action: 'document_uploaded',
        details: {
          sessionId,
          documentId,
          type,
          fileName: file.name,
          fileSize: file.size,
        },
      })

      console.log('Document uploaded:', documentId)
      return document

    } catch (error) {
      console.error('Failed to upload document:', error)
      throw new DocumentVerificationError(
        'Document upload failed',
        type,
        'UPLOAD_FAILED'
      )
    }
  }

  /**
   * Submit biometric data
   */
  async submitBiometric(sessionId: string, type: BiometricData['type'], data: any): Promise<BiometricData> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new VerificationError('Session not found', 'SESSION_NOT_FOUND')
    }

    try {
      const biometricId = this.generateBiometricId()
      
      const biometric: BiometricData = {
        id: biometricId,
        userId: session.userId,
        type,
        status: 'processing',
        confidence: 0,
        createdAt: new Date(),
        metadata: {
          sessionId,
          rawData: data,
        },
      }

      // Add to session
      session.biometrics.push(biometric)

      // Simulate biometric processing
      setTimeout(async () => {
        try {
          const processedBiometric = await this.processBiometric(biometric, data)
          
          // Update biometric in session
          const bioIndex = session.biometrics.findIndex(b => b.id === biometricId)
          if (bioIndex >= 0) {
            session.biometrics[bioIndex] = processedBiometric
          }

        } catch (error) {
          console.error('Biometric processing failed:', error)
          biometric.status = 'rejected'
          biometric.confidence = 0
        }
      }, 3000) // Simulate 3-second processing delay

      // Create audit log
      await databaseService.createAuditLog({
        userId: session.userId,
        action: 'biometric_submitted',
        details: {
          sessionId,
          biometricId,
          type,
        },
      })

      console.log('Biometric submitted:', biometricId)
      return biometric

    } catch (error) {
      console.error('Failed to submit biometric:', error)
      throw new BiometricVerificationError(
        'Biometric submission failed',
        type,
        0
      )
    }
  }

  /**
   * Get verification configuration
   */
  getConfiguration(): VerificationConfig | null {
    return this.config
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): VerificationSession | null {
    return this.sessions.get(sessionId) || null
  }

  // Private helper methods

  private generateSessionId(): string {
    return `vs_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  private generateBiometricId(): string {
    return `bio_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  private async generateVerificationSteps(level: VerificationLevel, levelConfig: any): Promise<VerificationStep[]> {
    const steps: VerificationStep[] = []
    let order = 1

    for (const stepType of levelConfig.requiredSteps) {
      steps.push({
        id: `step_${order}_${stepType}`,
        type: stepType as VerificationStepType,
        title: this.getStepTitle(stepType),
        description: this.getStepDescription(stepType),
        required: true,
        level,
        status: order === 1 ? VerificationStatus.IN_PROGRESS : VerificationStatus.NOT_STARTED,
        order,
        estimatedTime: this.getEstimatedTime(stepType),
      })
      order++
    }

    for (const stepType of levelConfig.optionalSteps) {
      steps.push({
        id: `step_${order}_${stepType}`,
        type: stepType as VerificationStepType,
        title: this.getStepTitle(stepType),
        description: this.getStepDescription(stepType),
        required: false,
        level,
        status: VerificationStatus.NOT_STARTED,
        order,
        estimatedTime: this.getEstimatedTime(stepType),
      })
      order++
    }

    return steps
  }

  private getStepTitle(stepType: string): string {
    const titles: Record<string, string> = {
      email_verification: 'Verify Email',
      phone_verification: 'Verify Phone',
      document_upload: 'Upload ID Document',
      selfie_verification: 'Take Selfie',
      liveness_check: 'Liveness Check',
      address_verification: 'Verify Address',
      biometric_verification: 'Biometric Verification',
      manual_review: 'Manual Review',
      enhanced_screening: 'Enhanced Screening',
    }
    return titles[stepType] || stepType
  }

  private getStepDescription(stepType: string): string {
    const descriptions: Record<string, string> = {
      email_verification: 'Confirm your email address',
      phone_verification: 'Confirm your phone number with SMS',
      document_upload: 'Upload a government-issued ID',
      selfie_verification: 'Take a photo of yourself',
      liveness_check: 'Perform liveness detection',
      address_verification: 'Verify your residential address',
      biometric_verification: 'Complete biometric verification',
      manual_review: 'Manual review by our team',
      enhanced_screening: 'Enhanced background screening',
    }
    return descriptions[stepType] || stepType
  }

  private getEstimatedTime(stepType: string): number {
    const times: Record<string, number> = {
      email_verification: 2,
      phone_verification: 3,
      document_upload: 5,
      selfie_verification: 3,
      liveness_check: 5,
      address_verification: 10,
      biometric_verification: 10,
      manual_review: 1440, // 24 hours
      enhanced_screening: 2880, // 48 hours
    }
    return times[stepType] || 5
  }

  private getNextStep(session: VerificationSession): VerificationStep | null {
    const currentIndex = session.steps.findIndex(s => s.id === session.currentStep)
    if (currentIndex >= 0 && currentIndex < session.steps.length - 1) {
      return session.steps[currentIndex + 1]
    }
    return null
  }

  private async processDocument(document: DocumentUpload, file: File): Promise<DocumentUpload> {
    // Simulate document processing with OCR/AI
    const confidence = Math.floor(Math.random() * 30) + 70 // 70-100%
    
    const extractedData: DocumentData = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      documentNumber: 'ABC123456',
      issuingAuthority: 'Government',
      issueDate: '2020-01-01',
      expirationDate: '2030-01-01',
    }

    return {
      ...document,
      status: confidence >= 80 ? 'verified' : 'rejected',
      verifiedAt: confidence >= 80 ? new Date() : undefined,
      extractedData,
      confidence,
      rejectionReason: confidence < 80 ? 'Low confidence in document authenticity' : undefined,
    }
  }

  private async processBiometric(biometric: BiometricData, data: any): Promise<BiometricData> {
    // Simulate biometric processing
    const confidence = Math.floor(Math.random() * 30) + 70 // 70-100%
    const matchScore = Math.floor(Math.random() * 20) + 80 // 80-100%
    const livenessScore = Math.floor(Math.random() * 25) + 75 // 75-100%

    return {
      ...biometric,
      status: confidence >= 80 ? 'verified' : 'rejected',
      verifiedAt: confidence >= 80 ? new Date() : undefined,
      confidence,
      matchScore,
      livenessScore,
    }
  }

  private async createEvent(event: Omit<VerificationEvent, 'id'>): Promise<VerificationEvent> {
    const fullEvent: VerificationEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...event,
    }

    // TODO: Store in database
    console.log('Verification event created:', fullEvent)
    
    return fullEvent
  }
}

// Export singleton instance
export const verificationService = VerificationService.getInstance() 