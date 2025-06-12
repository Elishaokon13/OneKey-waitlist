/**
 * Passkey Authentication Button Component
 * Provides passkey registration and authentication options
 */

'use client'

import { useState } from 'react'
import { usePasskeyAuth } from '@/hooks/usePasskeyAuth'

interface PasskeyButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  mode?: 'register' | 'authenticate' | 'auto'
  username?: string
  displayName?: string
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
}

export function PasskeyButton({ 
  className = '', 
  variant = 'primary',
  size = 'md',
  mode = 'auto',
  username,
  displayName,
  onSuccess,
  onError
}: PasskeyButtonProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    isSupported,
    isPlatformAuthenticatorAvailable,
    registerPasskey, 
    authenticateWithPasskey,
    signOut,
    user,
    error,
    clearError
  } = usePasskeyAuth()

  const [showUsernameInput, setShowUsernameInput] = useState(false)
  const [inputUsername, setInputUsername] = useState(username || '')
  const [inputDisplayName, setInputDisplayName] = useState(displayName || '')

  // Style variants
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  }

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  // Handle authentication action
  const handleAuthenticate = async () => {
    try {
      clearError()
      await authenticateWithPasskey(inputUsername || undefined)
      onSuccess?.(user)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      onError?.(errorMessage)
    }
  }

  // Handle registration action
  const handleRegister = async () => {
    try {
      clearError()
      
      if (!inputUsername || !inputDisplayName) {
        setShowUsernameInput(true)
        return
      }

      await registerPasskey(inputUsername, inputDisplayName)
      onSuccess?.(user)
      setShowUsernameInput(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      onError?.(errorMessage)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      clearError()
      await signOut()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      onError?.(errorMessage)
    }
  }

  // Show not supported message
  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-yellow-800 font-medium mb-2">
          Passkeys Not Supported
        </div>
        <div className="text-yellow-600 text-sm">
          Your browser doesn't support passkeys. Please use a modern browser or try Privy authentication.
        </div>
      </div>
    )
  }

  // Show platform authenticator not available
  if (!isPlatformAuthenticatorAvailable) {
    return (
      <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="text-orange-800 font-medium mb-2">
          Platform Authenticator Not Available
        </div>
        <div className="text-orange-600 text-sm">
          No platform authenticator (Face ID, Touch ID, Windows Hello) is available on this device.
        </div>
      </div>
    )
  }

  // Show error if any
  if (error) {
    return (
      <div className="space-y-3">
        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 font-medium mb-2">
            Authentication Error
          </div>
          <div className="text-red-600 text-sm mb-3">
            {error}
          </div>
          <button
            onClick={clearError}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show authenticated state
  if (isAuthenticated && user) {
    return (
      <div className="space-y-3">
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800 font-medium mb-2">
            ✓ Authenticated with Passkey
          </div>
          <div className="text-green-600 text-sm mb-3">
            Welcome back, {user.displayName}!
          </div>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="text-sm text-green-600 hover:text-green-800 underline disabled:opacity-50"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    )
  }

  // Show username input form
  if (showUsernameInput) {
    return (
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Create Your Passkey
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Enter your details to register a new passkey
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={inputDisplayName}
              onChange={(e) => setInputDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleRegister}
            disabled={isLoading || !inputUsername || !inputDisplayName}
            className={buttonStyles}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Passkey...
              </>
            ) : (
              <>
                🔐 Create Passkey
              </>
            )}
          </button>

          <button
            onClick={() => setShowUsernameInput(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Show main authentication options
  return (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Authenticate with Passkey
        </h3>
        <p className="text-sm text-gray-600">
          Use your device's biometric authentication or security key
        </p>
      </div>

      {mode === 'auto' || mode === 'authenticate' ? (
        <button
          onClick={handleAuthenticate}
          disabled={isLoading}
          className={buttonStyles}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Authenticating...
            </>
          ) : (
            <>
              🔐 Sign In with Passkey
            </>
          )}
        </button>
      ) : null}

      {mode === 'auto' || mode === 'register' ? (
        <button
          onClick={() => setShowUsernameInput(true)}
          disabled={isLoading}
          className={`${buttonStyles} ${mode === 'auto' ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
        >
          ➕ Create New Passkey
        </button>
      ) : null}

      <div className="text-center">
        <div className="text-xs text-gray-500 mt-2">
          Passkeys use your device's built-in security features like Face ID, Touch ID, or Windows Hello
        </div>
      </div>
    </div>
  )
} 