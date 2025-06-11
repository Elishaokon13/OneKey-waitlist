import React from 'react';
import { Background } from '@/components';

export default function KYCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Background>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>
    </Background>
  );
} 