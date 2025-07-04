import type { Metadata } from "next";
import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Reddit_Sans as GeistSans, Poppins, Inter, Space_Grotesk } from "next/font/google";
import {} from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import Script from "next/script";

import { Toaster } from "@/components/ui/toaster"



const geistSans = GeistSans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  icons: {
    icon: "/growify.svg",
    shortcut: "/growify.svg",
    apple: "/growify.svg",
  },
  keywords: [
    "OneKey",
      "identity verification",
      "KYC",
      "zero PII storage",
      "digital identity",
      "privacy",
      "secure verification",
      "identity platform",
      "user-controlled access",
      "privacy-first",
      "decentralized identity",
      "verification once use everywhere",
      "digital privacy",
      "secure identity",
      "identity management",
      "privacy technology",
      "verification platform",
      "identity security",
      "data privacy",
      "user privacy",
    ...siteConfig.keywords,
  ],
  authors: [
    {
      name: "OneKey",
      url: siteConfig.url,
    },
    {
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
  ],
  creator: "DefiDevrel",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [siteConfig.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage.url],
    creator: "@defidevrel",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "en-US": siteConfig.url,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={siteConfig.locale.split("-")[0]} suppressHydrationWarning>
      <head>
        <link rel="canonical" href={siteConfig.url} />
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteConfig.name,
              url: siteConfig.url,
              description: siteConfig.description,
              author: {
                "@type": "Person",
                name: siteConfig.author.name,
                url: siteConfig.author.url,
              },
              license: siteConfig.license,
              version: siteConfig.version,
            }),
          }}
        />
      </head>
      <body
        className={`${poppins.variable} ${inter.variable} ${geistSans.variable} ${spaceGrotesk.variable} antialiased bg-background font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="sm:container mx-auto w-[85vw] h-auto">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
