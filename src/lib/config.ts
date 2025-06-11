// Central configuration for Blink Protocol

export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Blink Protocol",
    domain: process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000",
    nodeEnv: process.env.NODE_ENV || "development",
  },
  
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
    appSecret: process.env.PRIVY_APP_SECRET || "",
  },
  
  lit: {
    network: process.env.NEXT_PUBLIC_LIT_NETWORK || "cayenne",
    relayApiKey: process.env.LIT_RELAY_API_KEY || "",
  },
  
  ethereum: {
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC || "",
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1"),
    easContractAddress: process.env.NEXT_PUBLIC_EAS_CONTRACT_ADDRESS || "",
  },
  
  kyc: {
    smileIdentity: {
      apiKey: process.env.SMILE_IDENTITY_API_KEY || "",
      partnerId: process.env.SMILE_IDENTITY_PARTNER_ID || "",
    },
    onfido: {
      apiKey: process.env.ONFIDO_API_KEY || "",
    },
    trulioo: {
      apiKey: process.env.TRULIOO_API_KEY || "",
    },
  },
  
  storage: {
    filecoin: {
      apiKey: process.env.FILECOIN_API_KEY || "",
    },
    arweave: {
      walletKey: process.env.ARWEAVE_WALLET_KEY || "",
    },
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET || "",
    encryptionKey: process.env.ENCRYPTION_KEY || "",
  },
  
  database: {
    url: process.env.DATABASE_URL || "",
  },
  
  rateLimit: {
    requests: parseInt(process.env.RATE_LIMIT_REQUESTS || "100"),
    window: parseInt(process.env.RATE_LIMIT_WINDOW || "900"), // 15 minutes
  },
} as const;

// Type definitions
export type Config = typeof config;

// Validation function
export function validateConfig(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'NEXT_PUBLIC_PRIVY_APP_ID',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.trim() === '';
  });
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

// Environment-specific configurations
export const isDevelopment = config.app.nodeEnv === 'development';
export const isProduction = config.app.nodeEnv === 'production';
export const isTest = config.app.nodeEnv === 'test'; 