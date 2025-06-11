"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Container from "../global/container";
import { SectionBadge } from "../ui/section-bade";
import { 
  Code, 
  Copy, 
  CheckCircle, 
  Terminal, 
  Zap,
  Download,
  ArrowRight
} from "lucide-react";
import { cn } from "@/functions/cn";

const CODE_EXAMPLES = {
  javascript: {
    title: "JavaScript SDK",
    language: "javascript",
    code: `import { UniversalKYC } from '@universal-kyc/sdk';

const kyc = new UniversalKYC({
  apiKey: process.env.KYC_API_KEY,
  network: 'ethereum' // or 'polygon'
});

// Initialize verification
const verification = await kyc.createVerification({
  provider: 'smile-identity',
  userId: user.id,
  requiredDocuments: ['passport', 'selfie']
});

// Check verification status
const status = await kyc.getStatus(verification.id);

if (status.verified) {
  // Generate reusable attestation
  const attestation = await kyc.generateAttestation({
    verificationId: verification.id,
    network: 'ethereum'
  });
  
  console.log('Attestation UID:', attestation.uid);
}`
  },
  react: {
    title: "React Hook",
    language: "tsx",
    code: `import { useKYCVerification } from '@universal-kyc/react';

function VerificationComponent() {
  const {
    startVerification,
    verification,
    attestation,
    loading,
    error
  } = useKYCVerification();

  const handleVerify = async () => {
    try {
      await startVerification({
        provider: 'onfido',
        documents: ['driver_license']
      });
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

  return (
    <div>
      {!verification ? (
        <button onClick={handleVerify} disabled={loading}>
          {loading ? 'Starting...' : 'Start KYC'}
        </button>
      ) : (
        <div>
          <p>Status: {verification.status}</p>
          {attestation && (
            <p>Attestation: {attestation.uid}</p>
          )}
        </div>
      )}
    </div>
  );
}`
  },
  python: {
    title: "Python SDK",
    language: "python",
    code: `from universal_kyc import UniversalKYC

# Initialize client
kyc = UniversalKYC(
    api_key=os.getenv('KYC_API_KEY'),
    network='ethereum'
)

# Create verification
verification = kyc.create_verification(
    provider='trulioo',
    user_id=user.id,
    documents=['passport', 'utility_bill']
)

# Poll for completion
while verification.status == 'pending':
    time.sleep(5)
    verification = kyc.get_verification(verification.id)

if verification.status == 'verified':
    # Generate attestation
    attestation = kyc.generate_attestation(
        verification_id=verification.id,
        network='ethereum'
    )
    
    print(f"Attestation UID: {attestation.uid}")
    print(f"Transaction: {attestation.transaction_hash}")`
  }
};

const INTEGRATION_STEPS = [
  {
    step: "01",
    title: "Install SDK",
    description: "Add our SDK to your project with your preferred package manager",
    command: "npm install @universal-kyc/sdk"
  },
  {
    step: "02", 
    title: "Configure API",
    description: "Set up your API keys and choose your preferred KYC provider",
    command: "export KYC_API_KEY=your_api_key_here"
  },
  {
    step: "03",
    title: "Integrate & Verify",
    description: "Start verification flows and generate reusable attestations",
    command: "kyc.createVerification({ provider: 'smile-identity' })"
  }
];

const DeveloperPreview = () => {
  const [activeTab, setActiveTab] = useState<keyof typeof CODE_EXAMPLES>('javascript');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      
      <Container>
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <SectionBadge title="Developer Experience" />
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold !leading-tight mt-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Built for Developers
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground mt-6 leading-relaxed"
          >
            Simple APIs, comprehensive SDKs, and detailed documentation to get you started in minutes.
          </motion.p>
        </div>
      </Container>

      <Container>
        <div className="mt-16 w-full max-w-6xl mx-auto">
          {/* Integration Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {INTEGRATION_STEPS.map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 border-2 border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-bold text-primary">{step.step}</span>
                  </div>
                  {index < INTEGRATION_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs text-foreground border">
                  {step.command}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Code Examples */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-background border border-border rounded-2xl overflow-hidden"
          >
            {/* Tab Headers */}
            <div className="flex border-b border-border bg-muted/30">
              {Object.entries(CODE_EXAMPLES).map(([key, example]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as keyof typeof CODE_EXAMPLES)}
                  className={cn(
                    "px-6 py-4 text-sm font-medium transition-colors border-b-2",
                    activeTab === key
                      ? "text-primary border-primary bg-background"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  {example.title}
                </button>
              ))}
            </div>

            {/* Code Content */}
            <div className="relative">
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {CODE_EXAMPLES[activeTab].title}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(CODE_EXAMPLES[activeTab].code, activeTab)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                >
                  {copiedCode === activeTab ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              
              <div className="p-6 bg-muted/5 overflow-x-auto">
                <pre className="text-sm text-foreground">
                  <code>{CODE_EXAMPLES[activeTab].code}</code>
                </pre>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            <div className="p-6 bg-muted/30 rounded-xl border border-border">
              <Code className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Multiple SDKs</h3>
              <p className="text-sm text-muted-foreground">JavaScript, Python, Go, and more with TypeScript support</p>
            </div>
            <div className="p-6 bg-muted/30 rounded-xl border border-border">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Fast Integration</h3>
              <p className="text-sm text-muted-foreground">Get started in under 10 minutes with our quick-start guide</p>
            </div>
            <div className="p-6 bg-muted/30 rounded-xl border border-border">
              <Download className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Comprehensive Docs</h3>
              <p className="text-sm text-muted-foreground">Detailed API reference, guides, and examples</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors cursor-pointer">
              <Code className="w-4 h-4" />
              <span className="font-medium">View Full Documentation</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default DeveloperPreview; 