"use client";

import { usePrivy } from '@privy-io/react-auth';
import { Shield, Settings, LogOut, Menu, Bell } from 'lucide-react';
import { useState } from 'react';

export function DashboardNav() {
  const { ready, authenticated, user, logout } = usePrivy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!ready) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Blink Protocol</span>
          </div>
          <div className="animate-pulse h-8 w-24 bg-muted rounded"></div>
        </div>
      </nav>
    );
  }

  if (!authenticated) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Please connect your wallet to continue</p>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Blink Protocol</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-4">
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Dashboard
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Verify KYC
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Attestations
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                History
              </a>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* Settings */}
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="h-5 w-5" />
            </button>

            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {user?.email?.address || user?.phone?.number || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {(user?.email?.address || user?.phone?.number || 'U')[0].toUpperCase()}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>

            {/* Mobile Menu */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-2">
              <a href="#" className="px-4 py-2 text-foreground hover:bg-muted rounded-md">
                Dashboard
              </a>
              <a href="#" className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-md">
                Verify KYC
              </a>
              <a href="#" className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-md">
                Attestations
              </a>
              <a href="#" className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-md">
                History
              </a>
            </nav>
            <div className="mt-4 pt-4 border-t">
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-foreground">
                  {user?.email?.address || user?.phone?.number || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 