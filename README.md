# Universal KYC Identity Platform

A privacy-preserving, user-controlled identity verification system that enables users to complete KYC once and reuse verified attestations across multiple platforms. Built with Next.js 14, React 18, and advanced Web3 technologies.

## 🚀 Overview

This platform addresses the fragmentation in traditional KYC processes by providing:

- **One-Time Verification**: Users complete KYC once and reuse it across integrated platforms
- **Zero PII Storage**: All sensitive data encrypted client-side and stored on decentralized networks
- **User-Controlled Access**: Users approve/deny data sharing via cryptographic signatures
- **Selective Disclosure**: ZKP-based proofs allow sharing specific attributes without revealing full data
- **Multi-Provider Support**: Flexible KYC adapter supporting multiple verification providers

## ✨ Key Features

- **Privacy-First Architecture**: Client-side encryption with AES-256-GCM
- **Decentralized Storage**: Filecoin + Arweave for encrypted data storage
- **Tamper-Proof Attestations**: Ethereum Attestation Service (EAS) integration
- **Advanced Access Control**: Lit Protocol for granular permissions
- **Web3 Abstraction**: Privy integration for seamless user experience
- **Multi-Provider KYC**: Support for Smile Identity, Onfido, Trulioo
- **Zero-Knowledge Proofs**: Selective disclosure without revealing sensitive data

## 🏗️ Architecture

### Core Components

1. **Authentication Layer**
   - Privy for account abstraction (email/phone/social → smart contract wallet)
   - Passkey fallback authentication (WebAuthn)

2. **KYC Verification Module**
   - Multi-provider adapter with dynamic routing
   - Fallback support for provider outages
   - Immediate PII disposal after encryption

3. **Storage & Access Control**
   - Client-side encryption (AES-256-GCM)
   - Filecoin for redundancy, Arweave for permanence
   - Lit Protocol for granular access control

4. **Attestation System**
   - Ethereum Attestation Service (EAS) for tamper-proof attestations
   - Off-chain attestations with on-chain verification
   - ZKP support for selective disclosure

5. **SDK & API Layer**
   - TypeScript SDK with React components
   - REST API for legacy integrations
   - Cross-platform compatibility

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Authentication**: Privy, WebAuthn/Passkeys
- **Encryption**: AES-256-GCM, secure enclaves
- **Storage**: Filecoin, Arweave
- **Access Control**: Lit Protocol  
- **Attestations**: Ethereum Attestation Service (EAS)
- **KYC Providers**: Smile Identity, Onfido, Trulioo
- **Zero-Knowledge**: ZKP libraries for selective disclosure
- **Backend**: Node.js/TypeScript, JWT, rate limiting

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/              # Authentication pages
│   │   ├── (dashboard)/         # User dashboard
│   │   ├── (kyc)/              # KYC verification flow
│   │   └── (marketing)/        # Landing pages
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   ├── kyc/                # KYC flow components
│   │   ├── dashboard/          # Dashboard components
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── auth/               # Authentication utilities
│   │   ├── crypto/             # Encryption utilities
│   │   ├── kyc/                # KYC provider adapters
│   │   ├── storage/            # Decentralized storage
│   │   └── attestation/        # EAS integration
│   ├── hooks/                  # Custom React hooks
│   └── constants/              # Configuration constants
├── public/                     # Static assets
└── docs/                       # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- API keys for required services:
  - Privy App ID
  - Lit Protocol configuration
  - KYC provider credentials (Smile Identity, Onfido, Trulioo)
  - Ethereum RPC endpoints

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Configuration

Create a `.env.local` file with required environment variables:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME="Universal KYC Platform"
NEXT_PUBLIC_APP_DOMAIN="your-domain.com"

# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id"

# Lit Protocol Configuration
NEXT_PUBLIC_LIT_NETWORK="cayenne"

# KYC Provider Configuration
SMILE_IDENTITY_API_KEY="your-smile-identity-key"
ONFIDO_API_KEY="your-onfido-key"
TRULIOO_API_KEY="your-trulioo-key"

# Ethereum Configuration
NEXT_PUBLIC_ETHEREUM_RPC="your-ethereum-rpc"
NEXT_PUBLIC_EAS_CONTRACT_ADDRESS="your-eas-contract"
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## 🔐 Security & Privacy

- ✅ **Zero PII Storage**: Backend never stores personally identifiable information
- ✅ **Client-Side Encryption**: AES-256-GCM encryption before any data transmission
- ✅ **Decentralized Storage**: Encrypted data stored on Filecoin/Arweave
- ✅ **User-Controlled Access**: Cryptographic signatures required for data access
- ✅ **Tamper-Proof Attestations**: EAS ensures attestation integrity
- ✅ **Selective Disclosure**: ZKP enables sharing specific attributes only

## 📖 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [SDK Usage Guide](./docs/sdk.md)
- [Integration Examples](./docs/examples.md)
- [Security Guidelines](./docs/security.md)

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

---

**Built for privacy, security, and user control.**
