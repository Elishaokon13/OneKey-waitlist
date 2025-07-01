/**
 * Verification Session Hooks
 * React hooks for managing KYC verification sessions
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { verificationService } from '@/lib/verification/verification-service'
import type {
  VerificationLevel,
  VerificationSession,
  VerificationStep,
  DocumentType,
  DocumentUpload,
  BiometricData,
  UseVerificationSessionReturn,
  UseVerificationConfigReturn,
  UseDocumentUploadReturn,
  VerificationError,
  DocumentVerificationError,
  BiometricVerificationError,
} from '@/lib/verification/types'

/**
 * Hook for managing verification sessions
 */
export function useVerificationSession(): UseVerificationSessionReturn {
  const [session, setSession] = useState<VerificationSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout>()

  // Calculate current step and progress
  const currentStep = session?.steps.find(step => step.id === session.currentStep) || null
  const progress = session ? {
    current: session.steps.filter(step => step.status === 'approved').length,
    total: session.steps.filter(step => step.required).length,
    percentage: Math.round(
      (session.steps.filter(step => step.status === 'approved').length / 
       session.steps.filter(step => step.required).length) * 100
    )
  } : { current: 0, total: 0, percentage: 0 }

  /**
   * Start verification session
   */
  const startVerification = useCallback(async (level: VerificationLevel): Promise<VerificationSession> => {
    setIsLoading(true)
    setError(null)

    try {
      const newSession = await verificationService.startVerification(level)
      setSession(newSession)
      
      // Start polling for updates
      startPolling(newSession.id)
      
      return newSession
    } catch (err) {
      const errorMessage = err instanceof VerificationError 
        ? err.message 
        : 'Failed to start verification'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Complete verification step
   */
  const completeStep = useCallback(async (stepId: string, data?: Record<string, any>): Promise<void> => {
    if (!session) {
      throw new Error('No active session')
    }

    setIsLoading(true)
    setError(null)

    try {
      await verificationService.completeStep(session.id, stepId, data)
      
      // Refresh session to get updated state
      await refreshSession()
    } catch (err) {
      const errorMessage = err instanceof VerificationError 
        ? err.message 
        : 'Failed to complete step'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Upload document
   */
  const uploadDocument = useCallback(async (type: DocumentType, file: File): Promise<DocumentUpload> => {
    if (!session) {
      throw new Error('No active session')
    }

    setIsLoading(true)
    setError(null)

    try {
      const document = await verificationService.uploadDocument(session.id, type, file)
      
      // Refresh session to include new document
      await refreshSession()
      
      return document
    } catch (err) {
      const errorMessage = err instanceof DocumentVerificationError 
        ? `Document upload failed: ${err.rejectionReason}` 
        : err instanceof VerificationError 
        ? err.message 
        : 'Failed to upload document'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Submit biometric data
   */
  const submitBiometric = useCallback(async (type: BiometricData['type'], data: any): Promise<BiometricData> => {
    if (!session) {
      throw new Error('No active session')
    }

    setIsLoading(true)
    setError(null)

    try {
      const biometric = await verificationService.submitBiometric(session.id, type, data)
      
      // Refresh session to include new biometric
      await refreshSession()
      
      return biometric
    } catch (err) {
      const errorMessage = err instanceof BiometricVerificationError 
        ? `Biometric verification failed: confidence ${err.confidence}%` 
        : err instanceof VerificationError 
        ? err.message 
        : 'Failed to submit biometric data'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Request manual review
   */
  const requestManualReview = useCallback(async (notes?: string): Promise<void> => {
    if (!session) {
      throw new Error('No active session')
    }

    setIsLoading(true)
    setError(null)

    try {
      // TODO: Implement manual review request API
      console.log('Manual review requested:', { sessionId: session.id, notes })
      
      // For now, just mark session as pending review
      setSession(prev => prev ? {
        ...prev,
        status: 'pending_review'
      } : null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request manual review'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Refresh session data
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    if (!session) return

    try {
      const updatedSession = verificationService.getSession(session.id)
      if (updatedSession) {
        setSession(updatedSession)
      }
    } catch (err) {
      console.error('Failed to refresh session:', err)
      // Don't throw or set error for refresh failures
    }
  }, [session])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Start polling for session updates
   */
  const startPolling = useCallback((sessionId: string) => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Poll every 3 seconds for updates
    refreshIntervalRef.current = setInterval(async () => {
      try {
        const updatedSession = verificationService.getSession(sessionId)
        if (updatedSession) {
          setSession(prev => {
            // Only update if there are actual changes
            if (!prev || JSON.stringify(prev) !== JSON.stringify(updatedSession)) {
              return updatedSession
            }
            return prev
          })
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 3000)
  }, [])

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = undefined
    }
  }, [])

  // Load existing session on mount
  useEffect(() => {
    const loadExistingSession = async () => {
      try {
        // TODO: Get current user ID from auth context
        // const existingSession = await verificationService.getActiveSession(userId)
        // if (existingSession) {
        //   setSession(existingSession)
        //   startPolling(existingSession.id)
        // }
      } catch (err) {
        console.error('Failed to load existing session:', err)
      }
    }

    loadExistingSession()
  }, [])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  return {
    session,
    currentStep,
    isLoading,
    error,
    progress,
    startVerification,
    completeStep,
    uploadDocument,
    submitBiometric,
    requestManualReview,
    refreshSession,
    clearError,
  }
}

/**
 * Hook for verification configuration
 */
export function useVerificationConfig(): UseVerificationConfigReturn {
  const [config, setConfig] = useState(verificationService.getConfiguration())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extract capabilities from config
  const capabilities = config?.providers.flatMap(provider => provider.capabilities) || []

  /**
   * Refresh configuration
   */
  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real implementation, this would fetch from API
      const newConfig = verificationService.getConfiguration()
      setConfig(newConfig)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    config,
    capabilities,
    isLoading,
    error,
    refresh,
  }
}

/**
 * Hook for document upload management
 */
export function useDocumentUpload(sessionId?: string): UseDocumentUploadReturn {
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  /**
   * Upload document
   */
  const uploadDocument = useCallback(async (type: DocumentType, file: File): Promise<DocumentUpload> => {
    if (!sessionId) {
      throw new Error('No session ID provided')
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const document = await verificationService.uploadDocument(sessionId, type, file)
      
      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Add to documents list
      setDocuments(prev => [...prev, document])
      
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000)
      
      return document
    } catch (err) {
      const errorMessage = err instanceof DocumentVerificationError 
        ? `Upload failed: ${err.rejectionReason}` 
        : err instanceof Error 
        ? err.message 
        : 'Failed to upload document'
      setError(errorMessage)
      setUploadProgress(0)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [sessionId])

  /**
   * Delete document
   */
  const deleteDocument = useCallback(async (documentId: string): Promise<void> => {
    setError(null)

    try {
      // TODO: Implement document deletion API
      console.log('Deleting document:', documentId)
      
      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document'
      setError(errorMessage)
      throw err
    }
  }, [])

  /**
   * Retry verification for a document
   */
  const retryVerification = useCallback(async (documentId: string): Promise<void> => {
    setError(null)

    try {
      // TODO: Implement retry verification API
      console.log('Retrying verification for document:', documentId)
      
      // Update document status to processing
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'processing' }
          : doc
      ))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry verification'
      setError(errorMessage)
      throw err
    }
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load documents for session
  useEffect(() => {
    if (sessionId) {
      const session = verificationService.getSession(sessionId)
      if (session) {
        setDocuments(session.documents)
      }
    }
  }, [sessionId])

  return {
    documents,
    isUploading,
    uploadProgress,
    error,
    uploadDocument,
    deleteDocument,
    retryVerification,
    clearError,
  }
}

/**
 * Hook for simple verification status checking
 */
export function useVerificationStatus(userId?: string) {
  const [status, setStatus] = useState<{
    level: VerificationLevel
    isVerified: boolean
    isInProgress: boolean
    lastUpdated?: Date
  } | null>(null)

  useEffect(() => {
    if (userId) {
      // TODO: Implement status checking
      console.log('Checking verification status for user:', userId)
    }
  }, [userId])

  return status
} 