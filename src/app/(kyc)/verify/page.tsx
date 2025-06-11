import React from 'react';
import { ShieldCheckIcon, UploadIcon, UserCheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function KYCVerifyPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <ShieldCheckIcon className="h-16 w-16 text-blue-500 mx-auto" />
        <h1 className="mt-4 text-3xl font-bold text-white">
          KYC Verification
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Complete your identity verification once, use it everywhere
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <UploadIcon className="h-8 w-8 text-blue-400 mx-auto" />
            <CardTitle className="text-lg text-white">Step 1</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Upload your government-issued ID and take a selfie for verification
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <ShieldCheckIcon className="h-8 w-8 text-purple-400 mx-auto" />
            <CardTitle className="text-lg text-white">Step 2</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Your data is encrypted client-side and verified by our trusted providers
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <UserCheckIcon className="h-8 w-8 text-green-400 mx-auto" />
            <CardTitle className="text-lg text-white">Step 3</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Receive your verifiable attestation and start using it across platforms
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          Start Verification Process
        </Button>
        <p className="mt-4 text-sm text-gray-500">
          🔒 Your personal information is encrypted and never stored on our servers
        </p>
      </div>
    </div>
  );
} 