// Core types for Universal KYC Platform

// User Authentication Types
export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// KYC Provider Types
export enum KYCProvider {
  SMILE_IDENTITY = 'smile_identity',
  ONFIDO = 'onfido',
  TRULIOO = 'trulioo',
}

export enum KYCStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export enum DocumentType {
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  NATIONAL_ID = 'national_id',
  UTILITY_BILL = 'utility_bill',
}

export interface KYCDocument {
  type: DocumentType;
  file: File;
  country: string;
}

export interface KYCVerificationRequest {
  userId: string;
  provider: KYCProvider;
  documents: KYCDocument[];
  selfie?: File;
  country: string;
  metadata?: Record<string, any>;
}

export interface KYCVerificationResult {
  passed: boolean;
  provider: KYCProvider;
  sessionId: string;
  metadata: {
    name?: string;
    dateOfBirth?: string;
    country: string;
    documentNumber?: string;
    verificationId: string;
    attributes: KYCAttribute[];
  };
  failureReasons?: string[];
  confidence?: number;
}

export interface KYCAttribute {
  key: string;
  value: string | boolean | number;
  verified: boolean;
  zkpCompatible: boolean; // Can this attribute be used in ZK proofs?
}

// Encryption & Storage Types
export interface EncryptedData {
  encryptedPayload: string;
  encryptedKey: string;
  iv: string;
  authTag: string;
  algorithm: string;
}

export interface StorageLocation {
  filecoinCid?: string;
  arweaveTxId?: string;
  ipfsHash?: string;
  storageProvider: 'filecoin' | 'arweave' | 'ipfs';
  accessControlConditions: LitAccessControlCondition[];
}

export interface LitAccessControlCondition {
  contractAddress: string;
  standardContractType: string;
  chain: string;
  method: string;
  parameters: string[];
  returnValueTest: {
    comparator: string;
    value: string;
  };
}

// EAS Attestation Types
export interface EASAttestation {
  uid: string;
  schema: string;
  recipient: string;
  attester: string;
  time: number;
  expirationTime: number;
  revocationTime: number;
  refUID: string;
  data: EASAttestationData;
  signature: string;
}

export interface EASAttestationData {
  provider: KYCProvider;
  country: string;
  kyc_passed: boolean;
  data_hash: string;
  selective_attributes: string[];
  timestamp: number;
  verification_level: 'basic' | 'enhanced';
}

// ZK Proof Types
export interface ZKProofRequest {
  attribute: string;
  condition: 'equals' | 'greater_than' | 'less_than' | 'range';
  value: string | number;
  includeProof: boolean;
}

export interface ZKProof {
  proof: string;
  publicSignals: string[];
  verificationKey: string;
  attribute: string;
  condition: string;
  verified: boolean;
}

// Access Control Types
export interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  userId: string;
  requestedAttributes: string[];
  justification: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  createdAt: Date;
  respondedAt?: Date;
  expiresAt?: Date;
}

export interface AccessGrant {
  id: string;
  userId: string;
  grantedTo: string;
  grantedAttributes: string[];
  expiresAt?: Date;
  isRevoked: boolean;
  createdAt: Date;
  revokedAt?: Date;
}

// Platform Integration Types
export interface PlatformIntegration {
  id: string;
  name: string;
  domain: string;
  apiKey: string;
  isActive: boolean;
  permissions: string[];
  createdAt: Date;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId: string;
    timestamp: number;
  };
}

// SDK Types
export interface SDKConfig {
  privyAppId: string;
  litNetwork: string;
  easContractAddress: string;
  chainId: number;
  apiEndpoint: string;
}

export interface SDKUser {
  id: string;
  walletAddress: string;
  isAuthenticated: boolean;
  hasKYC: boolean;
  kycStatus: KYCStatus;
  attestations: EASAttestation[];
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  completedKYC: number;
  pendingVerifications: number;
  attestationsCreated: number;
  platformsIntegrated: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Error Types
export class KYCError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: KYCProvider,
    public details?: any
  ) {
    super(message);
    this.name = 'KYCError';
  }
}

export class EncryptionError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'EncryptionError';
  }
}

export class AttestationError extends Error {
  constructor(message: string, public attestationId?: string, public details?: any) {
    super(message);
    this.name = 'AttestationError';
  }
} 