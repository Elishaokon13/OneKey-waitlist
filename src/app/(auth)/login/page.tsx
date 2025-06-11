import React from 'react';
import { ShieldCheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KYC_PLATFORM_NAME } from '@/constants';

export default function LoginPage() {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <ShieldCheckIcon className="h-12 w-12 text-blue-500" />
      </div>
      <h2 className="mt-6 text-3xl font-bold text-white">
        Sign in to {KYC_PLATFORM_NAME}
      </h2>
      <p className="mt-2 text-sm text-gray-400">
        Access your universal identity verification
      </p>
      
      <div className="mt-8 space-y-4">
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          Connect with Privy
        </Button>
        <Button variant="outline" className="w-full">
          Use Passkey
        </Button>
      </div>
      
      <div className="mt-6">
        <p className="text-xs text-gray-500">
          By signing in, you agree to our privacy-first approach. 
          Your data is encrypted client-side and never stored on our servers.
        </p>
      </div>
    </div>
  );
} 