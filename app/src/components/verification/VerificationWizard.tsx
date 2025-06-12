/**
 * Verification Wizard Component
 * Main component for guiding users through KYC verification process
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useVerificationSession, useVerificationConfig } from '@/hooks/useVerificationSession'
import type { VerificationLevel, VerificationStepType } from '@/lib/verification/types'

interface VerificationWizardProps {
  level: VerificationLevel
  onComplete?: (sessionId: string) => void
  onCancel?: () => void
  className?: string
}

export function VerificationWizard({
  level,
  onComplete,
  onCancel,
  className = ''
}: VerificationWizardProps) {
  const {
    session,
    currentStep,
    isLoading,
    error,
    progress,
    startVerification,
    completeStep,
    uploadDocument,
    submitBiometric,
    clearError
  } = useVerificationSession()

  const { config } = useVerificationConfig()
  const [hasStarted, setHasStarted] = useState(false)

  // Start verification on mount if not already started
  useEffect(() => {
    if (!hasStarted && !session) {
      handleStartVerification()
    }
  }, [hasStarted, session])

  const handleStartVerification = async () => {
    try {
      setHasStarted(true)
      await startVerification(level)
    } catch (err) {
      console.error('Failed to start verification:', err)
    }
  }

  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    try {
      await completeStep(stepId, data)
      
      // Check if all steps are completed
      if (session && progress.current === progress.total) {
        onComplete?.(session.id)
      }
    } catch (err) {
      console.error('Failed to complete step:', err)
    }
  }

  const handleFileUpload = async (file: File, documentType: any) => {
    try {
      await uploadDocument(documentType, file)
    } catch (err) {
      console.error('Failed to upload document:', err)
    }
  }

  const levelConfig = config?.levels[level]

  if (!config || !levelConfig) {
    return (
      <div className={`max-w-2xl mx-auto p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification configuration...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`max-w-2xl mx-auto p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Verification Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <button
                  onClick={clearError}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className={`max-w-2xl mx-auto p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Starting verification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{levelConfig.name}</h1>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="mt-2 text-gray-600">{levelConfig.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{progress.current} of {progress.total} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {session.steps.map((step, index) => (
          <VerificationStepCard
            key={step.id}
            step={step}
            isActive={step.id === currentStep?.id}
            isCompleted={step.status === 'approved'}
            onComplete={(data) => handleStepComplete(step.id, data)}
            onFileUpload={handleFileUpload}
            config={config}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Footer */}
      {session.status === 'pending_review' && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Under Review</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Your verification is under review. We'll notify you once it's complete.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface VerificationStepCardProps {
  step: any
  isActive: boolean
  isCompleted: boolean
  onComplete: (data?: Record<string, any>) => void
  onFileUpload: (file: File, documentType: any) => void
  config: any
  isLoading: boolean
}

function VerificationStepCard({
  step,
  isActive,
  isCompleted,
  onComplete,
  onFileUpload,
  config,
  isLoading
}: VerificationStepCardProps) {
  const [stepData, setStepData] = useState<Record<string, any>>({})

  const handleComplete = () => {
    onComplete(stepData)
  }

  const getStepIcon = (type: VerificationStepType) => {
    switch (type) {
      case 'email_verification':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'phone_verification':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        )
      case 'document_upload':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'selfie_verification':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      default:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getStepStatus = () => {
    if (isCompleted) return 'completed'
    if (isActive) return 'active'
    return 'pending'
  }

  const status = getStepStatus()

  return (
    <div className={`border rounded-lg transition-all duration-200 ${
      status === 'active' ? 'border-blue-300 shadow-md' :
      status === 'completed' ? 'border-green-300 bg-green-50' :
      'border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Step Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            status === 'completed' ? 'bg-green-500 text-white' :
            status === 'active' ? 'bg-blue-500 text-white' :
            'bg-gray-200 text-gray-400'
          }`}>
            {status === 'completed' ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              getStepIcon(step.type)
            )}
          </div>

          {/* Step Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
              {step.required && (
                <span className="text-sm text-red-600 font-medium">Required</span>
              )}
            </div>
            <p className="mt-1 text-gray-600">{step.description}</p>
            <p className="mt-1 text-sm text-gray-500">
              Estimated time: {step.estimatedTime} minutes
            </p>

            {/* Step Actions */}
            {isActive && !isCompleted && (
              <div className="mt-4">
                <VerificationStepContent
                  step={step}
                  onComplete={handleComplete}
                  onFileUpload={onFileUpload}
                  onDataChange={setStepData}
                  config={config}
                  isLoading={isLoading}
                />
              </div>
            )}

            {isCompleted && step.completedAt && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed on {new Date(step.completedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface VerificationStepContentProps {
  step: any
  onComplete: () => void
  onFileUpload: (file: File, documentType: any) => void
  onDataChange: (data: Record<string, any>) => void
  config: any
  isLoading: boolean
}

function VerificationStepContent({
  step,
  onComplete,
  onFileUpload,
  onDataChange,
  config,
  isLoading
}: VerificationStepContentProps) {
  const [localData, setLocalData] = useState<Record<string, any>>({})

  const updateData = (key: string, value: any) => {
    const newData = { ...localData, [key]: value }
    setLocalData(newData)
    onDataChange(newData)
  }

  switch (step.type) {
    case 'email_verification':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
              onChange={(e) => updateData('email', e.target.value)}
            />
          </div>
          <button
            onClick={onComplete}
            disabled={isLoading || !localData.email}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Verification Email'}
          </button>
        </div>
      )

    case 'phone_verification':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1 (555) 123-4567"
              onChange={(e) => updateData('phone', e.target.value)}
            />
          </div>
          <button
            onClick={onComplete}
            disabled={isLoading || !localData.phone}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send SMS Code'}
          </button>
        </div>
      )

    case 'document_upload':
      return (
        <DocumentUploadStep
          onFileUpload={onFileUpload}
          onComplete={onComplete}
          config={config}
          isLoading={isLoading}
        />
      )

    case 'selfie_verification':
      return (
        <div className="space-y-4">
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Take a selfie for verification</p>
            </div>
          </div>
          <button
            onClick={onComplete}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Take Selfie'}
          </button>
        </div>
      )

    default:
      return (
        <div className="space-y-4">
          <p className="text-gray-600">Complete this step to continue.</p>
          <button
            onClick={onComplete}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Complete Step'}
          </button>
        </div>
      )
  }
}

interface DocumentUploadStepProps {
  onFileUpload: (file: File, documentType: any) => void
  onComplete: () => void
  config: any
  isLoading: boolean
}

function DocumentUploadStep({ onFileUpload, onComplete, config, isLoading }: DocumentUploadStepProps) {
  const [selectedDocType, setSelectedDocType] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedDocType) {
      setUploadedFile(file)
      onFileUpload(file, selectedDocType)
    }
  }

  const documentTypes = Object.entries(config?.documents || {})
    .filter(([_, docConfig]: [string, any]) => docConfig.required)
    .slice(0, 4) // Show first 4 document types

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Document Type</label>
        <select
          value={selectedDocType}
          onChange={(e) => setSelectedDocType(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select document type</option>
          {documentTypes.map(([type, docConfig]: [string, any]) => (
            <option key={type} value={type}>
              {docConfig.name}
            </option>
          ))}
        </select>
      </div>

      {selectedDocType && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Document</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      )}

      {uploadedFile && (
        <div className="text-sm text-green-600">
          File uploaded: {uploadedFile.name}
        </div>
      )}

      <button
        onClick={onComplete}
        disabled={isLoading || !uploadedFile}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Continue'}
      </button>
    </div>
  )
} 