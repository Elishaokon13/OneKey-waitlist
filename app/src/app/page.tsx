import { Suspense } from 'react';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { WelcomeSection } from '@/components/dashboard/welcome-section';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { AttestationsList } from '@/components/dashboard/attestations-list';
import { SecurityOverview } from '@/components/dashboard/security-overview';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Welcome Section */}
          <Suspense fallback={<LoadingSpinner />}>
            <WelcomeSection />
          </Suspense>

          {/* Quick Actions */}
          <Suspense fallback={<LoadingSpinner />}>
            <QuickActions />
          </Suspense>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Attestations List */}
            <div className="lg:col-span-2">
              <Suspense fallback={<LoadingSpinner />}>
                <AttestationsList />
              </Suspense>
            </div>

            {/* Security Overview Sidebar */}
            <div className="lg:col-span-1">
              <Suspense fallback={<LoadingSpinner />}>
                <SecurityOverview />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 