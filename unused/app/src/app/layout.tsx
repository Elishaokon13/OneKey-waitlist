import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { PrivyProvider } from '@/components/providers/privy-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Blink Protocol - KYC Platform',
  description: 'Complete KYC once, use everywhere. Privacy-preserving identity verification.',
  keywords: ['KYC', 'Identity Verification', 'Privacy', 'Blockchain', 'Web3'],
  authors: [{ name: 'Blink Protocol Team' }],
  creator: 'Blink Protocol',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  openGraph: {
    title: 'Blink Protocol - KYC Platform',
    description: 'Complete KYC once, use everywhere. Privacy-preserving identity verification.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    siteName: 'Blink Protocol',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blink Protocol - KYC Platform',
    description: 'Complete KYC once, use everywhere. Privacy-preserving identity verification.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyProvider>
            <div className="relative flex min-h-screen flex-col">
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </PrivyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 