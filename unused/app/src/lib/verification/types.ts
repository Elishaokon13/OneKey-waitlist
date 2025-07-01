/**
 * Identity Verification System Types
 * Comprehensive type definitions for KYC verification workflows
 */

import type { AuthMethod } from '@/lib/auth/unified-auth'

export enum VerificationLevel {
  NONE = 0,
  BASIC = 1,      // Email/Phone verification
  STANDARD = 2,   // Government ID + Address
  ENHANCED = 3,   // Biometric + Enhanced checks
  PREMIUM = 4,    // Full KYC + Enhanced Due Diligence
}

export enum VerificationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  REQUIRES_UPDATE = 'requires_update',
}

export enum DocumentType {
  // Government IDs
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  NATIONAL_ID = 'national_id',
  STATE_ID = 'state_id',
  
  // Proof of Address
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  LEASE_AGREEMENT = 'lease_agreement',
  GOVERNMENT_CORRESPONDENCE = 'government_correspondence',
  
  // Financial Documents
  TAX_RETURN = 'tax_return',
  EMPLOYMENT_LETTER = 'employment_letter',
  INCOME_STATEMENT = 'income_statement',
  
  // Business Documents
  BUSINESS_REGISTRATION = 'business_registration',
  ARTICLES_OF_INCORPORATION = 'articles_of_incorporation',
  OPERATING_AGREEMENT = 'operating_agreement',
}

export enum DocumentStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum VerificationStepType {
  EMAIL_VERIFICATION = 'email_verification',
  PHONE_VERIFICATION = 'phone_verification',
  DOCUMENT_UPLOAD = 'document_upload',
  SELFIE_VERIFICATION = 'selfie_verification',
  LIVENESS_CHECK = 'liveness_check',
  ADDRESS_VERIFICATION = 'address_verification',
  BIOMETRIC_VERIFICATION = 'biometric_verification',
  MANUAL_REVIEW = 'manual_review',
  ENHANCED_SCREENING = 'enhanced_screening',
}

export interface VerificationStep {
  id: string
  type: VerificationStepType
  title: string
  description: string
  required: boolean
  level: VerificationLevel
  status: VerificationStatus
  order: number
  estimatedTime: number // in minutes
  completedAt?: Date
  expiresAt?: Date
  metadata?: Record<string, any>
}

export interface DocumentUpload {
  id: string
  userId: string
  type: DocumentType
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: Date
  status: DocumentStatus
  verifiedAt?: Date
  expiresAt?: Date
  extractedData?: DocumentData
  rejectionReason?: string
  confidence?: number // 0-100
  metadata?: Record<string, any>
}

export interface DocumentData {
  // Personal Information
  firstName?: string
  lastName?: string
  middleName?: string
  dateOfBirth?: string
  placeOfBirth?: string
  nationality?: string
  gender?: string
  
  // Document Information
  documentNumber?: string
  issuingAuthority?: string
  issueDate?: string
  expirationDate?: string
  
  // Address Information
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  
  // Additional Fields
  [key: string]: string | undefined
}

export interface BiometricData {
  id: string
  userId: string
  type: 'facial_recognition' | 'liveness_detection' | 'voice_recognition'
  status: DocumentStatus
  confidence: number
  matchScore?: number
  livenessScore?: number
  createdAt: Date
  verifiedAt?: Date
  metadata?: Record<string, any>
}

export interface VerificationSession {
  id: string
  userId: string
  level: VerificationLevel
  status: VerificationStatus
  authMethod: AuthMethod
  startedAt: Date
  completedAt?: Date
  expiresAt: Date
  currentStep?: string
  steps: VerificationStep[]
  documents: DocumentUpload[]
  biometrics: BiometricData[]
  riskAssessment?: RiskAssessment
  reviewNotes?: string
  metadata?: Record<string, any>
}

export interface RiskAssessment {
  id: string
  userId: string
  level: RiskLevel
  score: number // 0-100
  factors: RiskFactor[]
  createdAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  notes?: string
}

export interface RiskFactor {
  type: string
  severity: RiskLevel
  description: string
  score: number
  source: string
  confidence: number
}

export interface VerificationProvider {
  id: string
  name: string
  type: 'document' | 'biometric' | 'screening' | 'address'
  enabled: boolean
  config: Record<string, any>
  capabilities: VerificationCapability[]
}

export interface VerificationCapability {
  type: VerificationStepType
  supportedDocuments?: DocumentType[]
  supportedCountries?: string[]
  averageProcessingTime: number
  accuracyRate: number
  costPerVerification: number
}

export interface VerificationConfig {
  levels: {
    [K in VerificationLevel]: {
      name: string
      description: string
      requiredSteps: VerificationStepType[]
      optionalSteps: VerificationStepType[]
      validityPeriod: number // in days
      autoApprove: boolean
    }
  }
  documents: {
    [K in DocumentType]: {
      name: string
      description: string
      acceptedFormats: string[]
      maxFileSize: number
      required: boolean
      level: VerificationLevel
    }
  }
  providers: VerificationProvider[]
  riskThresholds: {
    [K in RiskLevel]: {
      minScore: number
      maxScore: number
      autoReject: boolean
      requiresManualReview: boolean
    }
  }
}

export interface VerificationEvent {
  id: string
  sessionId: string
  userId: string
  type: 'step_started' | 'step_completed' | 'status_changed' | 'document_uploaded' | 'risk_assessed'
  stepId?: string
  oldStatus?: VerificationStatus
  newStatus?: VerificationStatus
  data?: Record<string, any>
  triggeredBy: 'user' | 'system' | 'admin'
  triggeredAt: Date
  ipAddress?: string
  userAgent?: string
}

export interface VerificationNotification {
  id: string
  userId: string
  sessionId: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  actionRequired: boolean
  actionUrl?: string
  sentAt: Date
  readAt?: Date
  channels: ('email' | 'sms' | 'push' | 'in_app')[]
}

// Hook return types
export interface UseVerificationSessionReturn {
  session: VerificationSession | null
  currentStep: VerificationStep | null
  isLoading: boolean
  error: string | null
  progress: {
    current: number
    total: number
    percentage: number
  }
  
  // Actions
  startVerification: (level: VerificationLevel) => Promise<VerificationSession>
  completeStep: (stepId: string, data?: Record<string, any>) => Promise<void>
  uploadDocument: (type: DocumentType, file: File) => Promise<DocumentUpload>
  submitBiometric: (type: BiometricData['type'], data: any) => Promise<BiometricData>
  requestManualReview: (notes?: string) => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
}

export interface UseVerificationConfigReturn {
  config: VerificationConfig | null
  capabilities: VerificationCapability[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export interface UseDocumentUploadReturn {
  documents: DocumentUpload[]
  isUploading: boolean
  uploadProgress: number
  error: string | null
  
  // Actions
  uploadDocument: (type: DocumentType, file: File) => Promise<DocumentUpload>
  deleteDocument: (documentId: string) => Promise<void>
  retryVerification: (documentId: string) => Promise<void>
  clearError: () => void
}

// API request/response types
export interface StartVerificationRequest {
  level: VerificationLevel
  authMethod: AuthMethod
  metadata?: Record<string, any>
}

export interface StartVerificationResponse {
  session: VerificationSession
  nextStep: VerificationStep
  estimatedTime: number
}

export interface CompleteStepRequest {
  stepId: string
  data?: Record<string, any>
  metadata?: Record<string, any>
}

export interface CompleteStepResponse {
  step: VerificationStep
  nextStep?: VerificationStep
  session: VerificationSession
}

export interface UploadDocumentRequest {
  type: DocumentType
  file: File
  metadata?: Record<string, any>
}

export interface UploadDocumentResponse {
  document: DocumentUpload
  processingTime?: number
  nextStep?: VerificationStep
}

export interface GetVerificationStatusResponse {
  session: VerificationSession
  events: VerificationEvent[]
  notifications: VerificationNotification[]
}

// Error types
export class VerificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'VerificationError'
  }
}

export class DocumentVerificationError extends VerificationError {
  constructor(
    message: string,
    public documentType: DocumentType,
    public rejectionReason: string,
    details?: Record<string, any>
  ) {
    super(message, 'DOCUMENT_VERIFICATION_FAILED', details)
    this.name = 'DocumentVerificationError'
  }
}

export class BiometricVerificationError extends VerificationError {
  constructor(
    message: string,
    public biometricType: BiometricData['type'],
    public confidence: number,
    details?: Record<string, any>
  ) {
    super(message, 'BIOMETRIC_VERIFICATION_FAILED', details)
    this.name = 'BiometricVerificationError'
  }
} 