/**
 * Unified Authentication Button Component
 * Provides seamless authentication experience with automatic method selection and fallback
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useUnifiedAuth, useAuthCapabilities } from '@/hooks/useUnifiedAuth'
import type { AuthMethod } from '@/lib/auth/unified-auth'

interface UnifiedAuthButtonProps {
  mode?: 'login' | 'register' | 'auto'
  preferredMethod?: AuthMethod
  showMethodSelector?: boolean
  className?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface AuthFormData {
  email: string
  username: string
  displayName: string
}

export function UnifiedAuthButton({
  mode = 'auto',
  preferredMethod,
  showMethodSelector = true,
  className = '',
  onSuccess,
  onError,
}: UnifiedAuthButtonProps) {
  const {
    isAuthenticated,
    currentUser,
    currentMethod,
    isAuthenticating,
    isRegistering,
    error,
    authenticate,
    register,
    signOut,
    clearError,
  } = useUnifiedAuth()

  const { capabilities, isLoading: capabilitiesLoading } = useAuthCapabilities()

  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>(preferredMethod || 'privy')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    username: '',
    displayName: '',
  })

  // Update selected method based on capabilities
  useEffect(() => {
    if (capabilities && !preferredMethod) {
      if (capabilities.privy.available) {
        setSelectedMethod('privy')
      } else if (capabilities.passkey.supported) {
        setSelectedMethod('passkey')
      }
    }
  }, [capabilities, preferredMethod])

  // Handle success callback
  useEffect(() => {
    if (isAuthenticated && onSuccess) {
      onSuccess()
    }
  }, [isAuthenticated, onSuccess])

  // Handle error callback
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  if (capabilitiesLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading authentication...</span>
      </div>
    )
  }

  if (!capabilities) {
    return (
      <div className={`text-center p-4 text-red-600 ${className}`}>
        Authentication not available
      </div>
    )
  }

  // Show signed-in state
  if (isAuthenticated && currentUser) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">
                Signed in as {currentUser.displayName}
              </p>
              <p className="text-xs text-green-600">
                Method: {currentMethod} {currentUser.walletAddress && `• ${currentUser.walletAddress.slice(0, 6)}...${currentUser.walletAddress.slice(-4)}`}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sm text-green-700 hover:text-green-900 underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleAuthenticate = async () => {
    clearError()
    
    try {
      if (mode === 'register' && selectedMethod === 'passkey') {
        if (!formData.username || !formData.displayName) {
          setShowForm(true)
          return
        }
        await register('passkey', {
          username: formData.username,
          displayName: formData.displayName,
        })
      } else if (mode === 'register' && selectedMethod === 'privy') {
        await register('privy', formData.email ? { email: formData.email } : undefined)
      } else {
        await authenticate({
          method: selectedMethod,
          email: formData.email || undefined,
          username: formData.username || undefined,
          displayName: formData.displayName || undefined,
        })
      }
      setShowForm(false)
    } catch (err) {
      console.error('Authentication failed:', err)
    }
  }

  const getMethodLabel = (method: AuthMethod) => {
    switch (method) {
      case 'privy':
        return 'Privy (Email/Wallet)'
      case 'passkey':
        return 'Passkey (Biometric)'
      default:
        return method
    }
  }

  const getMethodDescription = (method: AuthMethod) => {
    switch (method) {
      case 'privy':
        return 'Sign in with email, phone, or connect your wallet'
      case 'passkey':
        return 'Use Face ID, Touch ID, or Windows Hello'
      default:
        return ''
    }
  }

  const isMethodAvailable = (method: AuthMethod) => {
    if (method === 'privy') {
      return capabilities.privy.available
    }
    if (method === 'passkey') {
      return capabilities.passkey.supported
    }
    return false
  }

  const getAvailableMethods = (): AuthMethod[] => {
    const methods: AuthMethod[] = []
    if (capabilities.privy.available) methods.push('privy')
    if (capabilities.passkey.supported) methods.push('passkey')
    return methods
  }

  const availableMethods = getAvailableMethods()

  if (availableMethods.length === 0) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No authentication methods are currently available.
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Please check your configuration or try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={clearError}
            className="text-xs text-red-600 hover:text-red-800 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Method Selector */}
      {showMethodSelector && availableMethods.length > 1 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Choose authentication method:
          </label>
          <div className="space-y-2">
            {availableMethods.map((method) => (
              <label key={method} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="authMethod"
                  value={method}
                  checked={selectedMethod === method}
                  onChange={(e) => setSelectedMethod(e.target.value as AuthMethod)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getMethodLabel(method)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getMethodDescription(method)}
                  </p>
                  {method === 'passkey' && capabilities.passkey.platformAuthenticator && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Platform authenticator available
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Form Fields */}
      {(showForm || mode === 'register') && (
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          {selectedMethod === 'privy' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to see all login options
              </p>
            </div>
          )}

          {selectedMethod === 'passkey' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Choose a username"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Your display name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleAuthenticate}
        disabled={
          isAuthenticating || 
          isRegistering || 
          !isMethodAvailable(selectedMethod) ||
          (mode === 'register' && selectedMethod === 'passkey' && (!formData.username || !formData.displayName))
        }
        className={`
          w-full px-4 py-3 rounded-lg font-medium transition-colors
          ${isMethodAvailable(selectedMethod)
            ? 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
          ${(isAuthenticating || isRegistering) ? 'opacity-50' : ''}
        `}
      >
        {isAuthenticating || isRegistering ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>
              {mode === 'register' ? 'Creating account...' : 'Signing in...'}
            </span>
          </div>
        ) : (
          <>
            {mode === 'register' ? 'Create Account' : 'Sign In'} with {getMethodLabel(selectedMethod)}
          </>
        )}
      </button>

      {/* Fallback Information */}
      {availableMethods.length > 1 && !showMethodSelector && (
        <p className="text-xs text-gray-500 text-center">
          Using {getMethodLabel(selectedMethod)}. Other methods available in preferences.
        </p>
      )}

      {/* Method-specific Information */}
      {selectedMethod === 'passkey' && !capabilities.passkey.platformAuthenticator && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            No platform authenticator detected. You may need to use a security key or enable biometric authentication on your device.
          </p>
        </div>
      )}
    </div>
  )
} 