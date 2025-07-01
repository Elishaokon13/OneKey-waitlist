"use client";

import { usePrivy } from '@privy-io/react-auth';
import { ShieldCheck, Wallet, ArrowRight } from 'lucide-react';

export function WelcomeSection() {
  const { user, login } = usePrivy();

  if (!user) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="text-center space-y-4">
          <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Welcome to Blink Protocol</h1>
          <p className="text-muted-foreground">
            Complete KYC once, use everywhere. Privacy-preserving identity verification.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const displayName = user.email?.address || user.phone?.number || 'User';
  const firstName = displayName.split('@')[0].split('.')[0];

  return (
    <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your identity verification and attestations
          </p>
        </div>
        <div className="hidden md:block">
          <ShieldCheck className="h-16 w-16 text-primary" />
        </div>
      </div>
    </div>
  );
} 