/**
 * Privy Provider Component
 * Wraps the application with Privy authentication context
 */

'use client'

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth'
import { ReactNode } from 'react'

interface PrivyProviderProps {
  children: ReactNode
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!appId) {
    console.error('NEXT_PUBLIC_PRIVY_APP_ID is not configured')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Configuration Error
          </h2>
          <p className="text-gray-600">
            Privy App ID is not configured. Please check your environment variables.
          </p>
        </div>
      </div>
    )
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        // Appearance configuration
        appearance: {
          theme: 'dark',
          accentColor: '#6366F1',
          logo: '/logo.png',
        },
        
        // Login methods configuration
        loginMethods: ['email', 'wallet', 'sms', 'google', 'twitter'],
        
        // Embedded wallet configuration
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        
        // Legal configuration
        legal: {
          termsAndConditionsUrl: '/terms',
          privacyPolicyUrl: '/privacy',
        },
        
        // Additional configuration
        supportEmail: 'support@blinkprotocol.com',
        
        // Wallet configuration
        defaultChain: {
          id: 11155111, // Sepolia testnet
          name: 'Sepolia',
          network: 'sepolia',
          nativeCurrency: {
            decimals: 18,
            name: 'Ethereum',
            symbol: 'ETH',
          },
          rpcUrls: {
            default: {
              http: ['https://sepolia.infura.io/v3/'],
            },
            public: {
              http: ['https://sepolia.infura.io/v3/'],
            },
          },
          blockExplorers: {
            default: {
              name: 'Etherscan',
              url: 'https://sepolia.etherscan.io',
            },
          },
        },
        
        // Additional chains (optional)
        supportedChains: [
          {
            id: 1,
            name: 'Ethereum',
            network: 'homestead',
            nativeCurrency: {
              decimals: 18,
              name: 'Ethereum',
              symbol: 'ETH',
            },
            rpcUrls: {
              default: {
                http: ['https://mainnet.infura.io/v3/'],
              },
              public: {
                http: ['https://mainnet.infura.io/v3/'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Etherscan',
                url: 'https://etherscan.io',
              },
            },
          },
          {
            id: 137,
            name: 'Polygon',
            network: 'matic',
            nativeCurrency: {
              decimals: 18,
              name: 'MATIC',
              symbol: 'MATIC',
            },
            rpcUrls: {
              default: {
                http: ['https://polygon-rpc.com'],
              },
              public: {
                http: ['https://polygon-rpc.com'],
              },
            },
            blockExplorers: {
              default: {
                name: 'PolygonScan',
                url: 'https://polygonscan.com',
              },
            },
          },
        ],
      }}
    >
      {children}
    </BasePrivyProvider>
  )
} 