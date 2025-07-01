# One-Time KYC System Architecture

This document outlines the architectural design and flow of the One-Time KYC system with Reusable Verifiable Attestations.

## Table of Contents
1. [System Overview](#system-overview)
2. [Core Components](#core-components)
3. [Flow Diagrams](#flow-diagrams)
   - [User Journey Flow](#user-journey-flow)
   - [Platform Interaction Flow](#platform-interaction-flow)
   - [KYC Verification Flow](#kyc-verification-flow)
   - [Data Storage and Access Flow](#data-storage-and-access-flow)
   - [Authentication Flow](#authentication-flow)

## System Overview

The One-Time KYC system enables users to complete KYC once and reuse their verified identity across multiple platforms while maintaining control over their data. The system leverages blockchain technology, decentralized storage, and zero-knowledge proofs to ensure security, privacy, and user sovereignty.

## Core Components

1. **Frontend SDK**
   - User interface components
   - Client-side encryption
   - Authentication integration
   - ZKP generation

2. **Identity Service Backend**
   - KYC orchestration
   - Provider integration
   - Attestation management
   - No PII storage

3. **Storage Layer**
   - Filecoin: Redundant storage
   - Arweave: Permanent storage
   - Encrypted data management

4. **Authentication Providers**
   - Privy: Wallet-based auth
   - Passkey: WebAuthn implementation
   - Signature verification

5. **KYC Providers**
   - Smile Identity
   - Onfido
   - Trulioo
   - Provider adapter layer

6. **Access Control**
   - Lit Protocol integration
   - Conditional access
   - Signature verification

7. **Attestation Service**
   - EAS integration
   - Off-chain attestations
   - Verification endpoints

## Flow Diagrams

### User Journey Flow

The User Journey Flow illustrates the end-to-end process of a user completing their KYC verification on Platform A. This flow demonstrates:
- Initial authentication using Privy or Passkey
- Secure document submission and encryption
- Interaction with the Identity Service for verification
- Creation of attestations and storage of encrypted data
- Final status notification to the user

### Platform Interaction Flow

The Platform Interaction Flow shows how a user's KYC attestation is reused on Platform B. Key aspects include:
- Querying existing attestations from EAS
- Retrieving encrypted data from decentralized storage
- Access control via Lit Protocol
- User approval for data sharing
- Selective disclosure of verified information

### KYC Verification Flow

The KYC Verification Flow details the backend process of verifying user identity. Notable features:
- Dynamic provider selection through the KYC Adapter
- Automatic fallback to alternative providers
- Result processing and attestation creation
- No storage of PII in the backend

### Data Storage and Access Flow

The Data Storage and Access Flow demonstrates how user data is securely stored and accessed:
- Dual storage strategy using Filecoin and Arweave
- Access control implementation via Lit Protocol
- Conditional access based on user permissions
- Secure data retrieval and decryption process

### Authentication Flow

The Authentication Flow shows the two primary authentication methods:
- Privy-based wallet authentication
- Passkey (WebAuthn) device-bound authentication
- Signing operations for various system actions
- Fallback mechanisms for authentication failures

## Security Considerations

1. **Data Privacy**
   - Client-side encryption using AES-256-GCM
   - Zero-knowledge proofs for selective disclosure
   - No storage of unencrypted PII

2. **Access Control**
   - User-controlled data sharing
   - Signature-based authorization
   - Conditional access via Lit Protocol

3. **Authentication Security**
   - Multiple authentication options
   - Hardware-backed key storage
   - Secure signature generation

4. **Infrastructure Security**
   - Decentralized storage
   - Tamper-proof attestations
   - Provider redundancy

## Implementation Guidelines

1. **Frontend Integration**
   - Embed SDK in platform frontend
   - Implement authentication flows
   - Handle encryption/decryption
   - Manage user interactions

2. **Backend Setup**
   - Deploy Identity Service
   - Configure KYC providers
   - Set up attestation service
   - Implement storage integration

3. **Testing Requirements**
   - End-to-end flow testing
   - Security audit
   - Performance testing
   - Provider failover testing

## Scalability Considerations

1. **Storage Scaling**
   - Multiple storage providers
   - Content addressing
   - Redundancy management

2. **Provider Scaling**
   - Dynamic provider selection
   - Load balancing
   - Geographic distribution

3. **Performance Optimization**
   - Caching strategies
   - Parallel processing
   - Efficient data routing 