# KYC System Development Guide

## Overview

This document provides development guidelines for the Blink Protocol KYC system - a privacy-preserving, user-controlled identity verification system.

## Development Environment Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### Installation

1. Clone the repository
2. Navigate to the app directory: `cd app`
3. Install dependencies: `npm install`
4. Copy environment variables: `cp env.example .env.local`
5. Start development server: `npm run dev`

### Environment Variables

Required environment variables for development:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_EAS_SCHEMA_UID=your-eas-schema-uid
NEXT_PUBLIC_LIT_NETWORK=cayenne
```

## Development Workflow

### Testing

- Run all tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Test coverage is set to 80% minimum for all metrics

### Code Quality

- Linting: `npm run lint`
- Fix linting issues: `npm run lint:fix`
- Type checking: `npm run type-check`

### Building

- Development build: `npm run build`
- Start production server: `npm start`

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── providers/      # Context providers
│   └── kyc/            # KYC-specific components
├── lib/                # Utility libraries
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── __tests__/          # Test files
```

## Testing Strategy

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Service integration testing
- **E2E Tests**: Full user journey testing (to be implemented)

## Code Standards

- TypeScript for all code
- ESLint for code quality
- Prettier for code formatting
- Jest for testing
- React Testing Library for component testing

## Git Workflow

1. Create feature branch from `develop`
2. Make changes with descriptive commits
3. Run tests and linting
4. Create pull request to `develop`
5. Code review and merge
6. Deploy to staging for testing
7. Merge to `main` for production

## CI/CD Pipeline

The project uses GitHub Actions for:
- Automated testing
- Code quality checks
- Security audits
- Build verification

## Security Considerations

- No PII storage in any logs or databases
- Client-side encryption for all sensitive data
- Regular security audits
- Dependency vulnerability scanning 