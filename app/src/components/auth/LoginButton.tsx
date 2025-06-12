/**
 * Login Button Component
 * Provides multiple authentication options using Privy
 */

'use client'

import { useState } from 'react'
import { usePrivyAuth } from '@/hooks/usePrivyAuth'

interface LoginButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showOptions?: boolean
}

export function LoginButton({ 
  className = '', 
  variant = 'primary',
  size = 'md',
  showOptions = true 
}: LoginButtonProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    loginWithEmail, 
    loginWithWallet, 
    loginWithSocial,
    logout,
    user,
    error,
    clearError
  } = usePrivyAuth()

  const [showLoginOptions, setShowLoginOptions] = useState(false)
  const [email, setEmail] = useState('')

  // Style variants
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-md
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `

  // Handle email login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    try {
      clearError()
      await loginWithEmail(email)
      setShowLoginOptions(false)
      setEmail('')
    } catch (err) {
      console.error('Email login failed:', err)
    }
  }

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'twitter' | 'discord' | 'github') => {
    try {
      clearError()
      await loginWithSocial(provider)
      setShowLoginOptions(false)
    } catch (err) {
      console.error(`${provider} login failed:`, err)
    }
  }

  // Handle wallet login
  const handleWalletLogin = async () => {
    try {
      clearError()
      await loginWithWallet()
      setShowLoginOptions(false)
    } catch (err) {
      console.error('Wallet login failed:', err)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  // If user is authenticated, show user info and logout
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {user.email || `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
          </div>
          <div className="text-gray-500">Connected</div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`${baseClasses} ${variant === 'primary' ? 'bg-red-600 hover:bg-red-700' : ''}`}
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    )
  }

  // Show login options
  if (showLoginOptions && showOptions) {
    return (
      <div className="relative">
        <div className="absolute top-0 right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sign In</h3>
            <button
              onClick={() => setShowLoginOptions(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Email Login */}
          <form onSubmit={handleEmailLogin} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !email}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? '...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Social Login Options */}
          <div className="space-y-2 mb-4">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="text-sm font-medium text-gray-700">Continue with Google</span>
            </button>
            
            <button
              onClick={() => handleSocialLogin('twitter')}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="text-sm font-medium text-gray-700">Continue with Twitter</span>
            </button>
          </div>

          {/* Wallet Login */}
          <button
            onClick={handleWalletLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            <span className="text-sm font-medium">Connect Wallet</span>
          </button>
        </div>
      </div>
    )
  }

  // Default login button
  return (
    <button
      onClick={() => showOptions ? setShowLoginOptions(true) : loginWithWallet()}
      disabled={isLoading}
      className={baseClasses}
    >
      {isLoading ? 'Connecting...' : 'Sign In'}
    </button>
  )
} 