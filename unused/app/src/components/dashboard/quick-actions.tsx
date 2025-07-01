"use client";

import { Plus, Shield, History, Share2 } from 'lucide-react';

const actions = [
  {
    title: 'Start KYC Verification',
    description: 'Begin identity verification process',
    icon: Plus,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    href: '/kyc/start',
  },
  {
    title: 'View Attestations',
    description: 'Manage your identity attestations',
    icon: Shield,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    href: '/attestations',
  },
  {
    title: 'Access History',
    description: 'View verification history',
    icon: History,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    href: '/history',
  },
  {
    title: 'Share Access',
    description: 'Grant platform access',
    icon: Share2,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    href: '/share',
  },
];

export function QuickActions() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <a
            key={action.title}
            href={action.href}
            className="group bg-card border rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-primary/50"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${action.bgColor}`}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 