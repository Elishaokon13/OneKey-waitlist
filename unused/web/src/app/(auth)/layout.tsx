import React from 'react';
import { Background } from '@/components';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Background>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {children}
        </div>
      </div>
    </Background>
  );
} 