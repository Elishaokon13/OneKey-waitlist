"use client";

import { CheckCircle, Clock, XCircle } from 'lucide-react';

const mockAttestations = [
  {
    id: '1',
    type: 'Identity Verification',
    status: 'verified',
    provider: 'Smile Identity',
    date: '2024-01-15',
    platforms: 3,
  },
  {
    id: '2',
    type: 'Age Verification',
    status: 'pending',
    provider: 'Onfido',
    date: '2024-01-20',
    platforms: 0,
  },
];

export function AttestationsList() {
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Your Attestations</h2>
        <button className="text-primary hover:text-primary/80 text-sm">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {mockAttestations.map((attestation) => (
          <div key={attestation.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {attestation.status === 'verified' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {attestation.status === 'pending' && (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                  {attestation.status === 'failed' && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{attestation.type}</h3>
                  <p className="text-sm text-muted-foreground">
                    via {attestation.provider}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {attestation.date}
                </p>
                <p className="text-xs text-muted-foreground">
                  {attestation.platforms} platforms
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {mockAttestations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No attestations yet. Start your first KYC verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 