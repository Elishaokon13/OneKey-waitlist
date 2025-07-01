/**
 * Core Services Configuration
 * Centralized configuration for all third-party service integrations
 */

export const SERVICES_CONFIG = {
  // Privy Authentication Configuration
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'test-privy-app-id',
    config: {
      loginMethods: ['email', 'wallet', 'sms', 'google', 'twitter'] as const,
      appearance: {
        theme: 'dark' as const,
        accentColor: '#676FFF',
        logo: '/logo.png',
      },
      embeddedWallets: {
        createOnLogin: 'users-without-wallets' as const,
      },
    },
  },

  // Ethereum Attestation Service Configuration
  eas: {
    schemaUID: process.env.NEXT_PUBLIC_EAS_SCHEMA_UID || 'test-schema-uid',
    contractAddress: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587', // Sepolia testnet
    graphQLEndpoint: 'https://sepolia.easscan.org/graphql',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.infura.io/v3/your-key',
  },

  // Lit Protocol Configuration
  lit: {
    network: (process.env.NEXT_PUBLIC_LIT_NETWORK as 'cayenne' | 'manzano' | 'habanero') || 'cayenne',
    debug: process.env.NODE_ENV === 'development',
  },

  // Decentralized Storage Configuration
  storage: {
    lighthouse: {
      apiKey: process.env.LIGHTHOUSE_API_KEY || 'test-lighthouse-key',
      endpoint: 'https://node.lighthouse.storage',
    },
    arweave: {
      host: 'arweave.net',
      port: 443,
      protocol: 'https',
      timeout: 20000,
      logging: process.env.NODE_ENV === 'development',
    },
  },

  // Environment flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

// Type definitions for service configurations
export type ServicesConfig = typeof SERVICES_CONFIG
export type PrivyConfig = typeof SERVICES_CONFIG.privy
export type EASConfig = typeof SERVICES_CONFIG.eas
export type LitConfig = typeof SERVICES_CONFIG.lit
export type StorageConfig = typeof SERVICES_CONFIG.storage 