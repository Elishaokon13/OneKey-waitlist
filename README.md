# OneKey - Identity Verification Platform

> **Verify Once, Use Everywhere** - Secure identity verification with zero PII storage and user-controlled access.

![OneKey Platform](https://onekey.arihant.us/og.png)

## 🚀 Overview

OneKey is a privacy-first identity verification platform that enables users to complete KYC (Know Your Customer) verification once and use it everywhere. Our innovative approach ensures **zero PII storage** while providing seamless, secure verification across multiple services.

### ✨ Key Features

- **🔐 Zero PII Storage** - Your personal data never leaves your control
- **🌍 Universal Verification** - Verify once, use everywhere
- **🛡️ Privacy-First** - User-controlled access to verification status
- **⚡ Instant Verification** - No repeated KYC processes
- **🎯 Simple Integration** - Easy API for service providers

## 🎯 Current Status

This is the **landing page and waitlist** for the OneKey platform. The site features:

- **Hero Section** - Clear value proposition and platform overview
- **Waitlist Signup** - Email collection for early access
- **Responsive Design** - Works perfectly on all devices
- **Dark/Light Theme** - User preference support
- **Smooth Animations** - Professional user experience

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: Radix UI primitives
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Blink-Protocol-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the site.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Landing page
│   └── globals.css     # Global styles
├── components/
│   ├── ui/             # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── hero.tsx        # Hero section
│   ├── navbar.tsx      # Navigation
│   ├── waitlist.tsx    # Waitlist signup form
│   └── footer.tsx      # Footer
├── config/
│   └── site.ts         # Site configuration
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

## 🎨 Design System

The site uses a cohesive design system with:

- **Typography**: Poppins (headings), Inter (body), Reddit Sans (accent)
- **Colors**: Primary blue (#1e40af), semantic colors for states
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable UI primitives with variants
- **Animations**: Smooth transitions and micro-interactions

## 📱 Features

### Landing Page
- **Hero Section**: Clear messaging about identity verification
- **Value Proposition**: "Verify Once, Use Everywhere"
- **Call-to-Action**: Join waitlist button with smooth scroll
- **Responsive**: Mobile-first design approach

### Waitlist Signup
- **Email Collection**: Simple form with validation
- **Success States**: Confirmation message with animations
- **Error Handling**: User-friendly error messages
- **Privacy Notice**: Clear data usage information

### User Experience
- **Theme Toggle**: Seamless dark/light mode switching
- **Smooth Scrolling**: Animated transitions between sections
- **Loading States**: Proper feedback for user actions
- **Accessibility**: WCAG compliant design

## 🔧 Configuration

### Site Configuration

Edit `src/config/site.ts` to update:

```typescript
export const siteConfig = {
  name: "OneKey",
  description: "Secure identity verification platform...",
  url: "https://onekey.arihant.us",
  ogImage: "https://onekey.arihant.us/og.png",
  links: {
    twitter: "https://x.com/arihantcodes",
    github: "https://github.com/arihantcodes"
  }
}
```

### Environment Variables

Create `.env.local` for any environment-specific configuration:

```bash
# Add any future API keys or configuration here
# Currently no environment variables required
```

## 📊 SEO & Performance

The site is optimized for:

- **SEO**: Proper meta tags, structured data, sitemap
- **Performance**: Optimized images, code splitting, minimal bundle
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Core Web Vitals**: Fast loading, responsive, stable layout

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
npm run build
vercel --prod
```

## 🙏 Acknowledgments

- Design inspiration from modern SaaS platforms
- UI components built with Radix UI
- Icons provided by Lucide
- Fonts from Google Fonts

---

**OneKey** - Building the future of privacy-first identity verification. 🚀
