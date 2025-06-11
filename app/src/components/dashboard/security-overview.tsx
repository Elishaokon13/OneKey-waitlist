"use client";

import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

const securityMetrics = [
  {
    label: 'Encryption Status',
    value: 'Active',
    icon: Lock,
    status: 'good',
    description: 'AES-256-GCM encryption enabled',
  },
  {
    label: 'Data Privacy',
    value: 'Zero PII',
    icon: Eye,
    status: 'good',
    description: 'No personal data stored',
  },
  {
    label: 'Access Control',
    value: 'User Only',
    icon: Shield,
    status: 'good',
    description: 'You control all access',
  },
];

export function SecurityOverview() {
  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Security Overview</h2>
        
        <div className="space-y-4">
          {securityMetrics.map((metric) => (
            <div key={metric.label} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <metric.icon className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className="text-sm text-green-500">{metric.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">Attestation verified</span>
            <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-muted-foreground">Platform access granted</span>
            <span className="text-xs text-muted-foreground ml-auto">1d ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-muted-foreground">KYC initiated</span>
            <span className="text-xs text-muted-foreground ml-auto">3d ago</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-700 dark:text-yellow-300">
              Security Tip
            </h4>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              Always verify the domain before sharing access to your attestations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 