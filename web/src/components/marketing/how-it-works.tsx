"use client";

import React from "react";
import { motion } from "framer-motion";
import Container from "../global/container";
import { SectionBadge } from "../ui/section-bade";
import { 
  Wallet, 
  ShieldCheck, 
  Award, 
  RefreshCw,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { cn } from "@/functions/cn";

const STEPS = [
  {
    id: 1,
    icon: Wallet,
    title: "Connect & Verify",
    description: "Connect your wallet or use Passkey authentication to begin the secure verification process.",
    details: "Privy-powered authentication with multiple wallet options",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    id: 2,
    icon: ShieldCheck,
    title: "Complete KYC",
    description: "Choose from trusted providers like Smile Identity, Onfido, or Trulioo for verification.",
    details: "Multiple KYC providers, encrypted client-side processing",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    id: 3,
    icon: Award,
    title: "Generate Attestation",
    description: "Receive a tamper-proof blockchain attestation via Ethereum Attestation Service.",
    details: "Immutable, verifiable, cryptographically secure",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  {
    id: 4,
    icon: RefreshCw,
    title: "Reuse Everywhere",
    description: "Access any integrated platform instantly using your verified identity attestation.",
    details: "Zero PII storage, user-controlled access permissions",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  }
];

const HowItWorks = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      
      <Container>
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <SectionBadge title="How it Works" />
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold !leading-tight mt-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Complete KYC once, use everywhere
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground mt-6 leading-relaxed"
          >
            Our privacy-first approach ensures your identity verification is secure, reusable, and completely under your control.
          </motion.p>
        </div>
      </Container>

      <Container>
        <div className="mt-16 w-full max-w-6xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connection Lines */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 via-green-500/20 to-orange-500/20 -translate-y-1/2 z-0"></div>
              
              <div className="grid grid-cols-4 gap-8 relative z-10">
                {STEPS.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <StepCard step={step} index={index} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-8">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <StepCard step={step} index={index} mobile />
                                 {index < STEPS.length - 1 && (
                   <div className="flex justify-center mt-6">
                     <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 lg:rotate-0" />
                   </div>
                 )}
              </motion.div>
            ))}
          </div>
        </div>
      </Container>

      {/* Bottom CTA */}
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex flex-col items-center text-center"
        >
                     <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
             <CheckCircle className="w-4 h-4 text-green-500" />
             <span className="text-sm text-green-600 font-medium">Takes less than 5 minutes</span>
           </div>
          <p className="text-muted-foreground text-sm max-w-md">
            Join thousands of users who have simplified their identity verification process
          </p>
        </motion.div>
      </Container>
    </div>
  );
};

const StepCard = ({ step, index, mobile = false }: { 
  step: typeof STEPS[0]; 
  index: number; 
  mobile?: boolean; 
}) => {
  const Icon = step.icon;
  
  return (
    <div className={cn(
      "relative group",
      mobile ? "w-full" : "w-full max-w-xs"
    )}>
      {/* Step Number */}
      <div className="flex justify-center mb-6">
        <div className={cn(
          "relative w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110",
          step.borderColor,
          step.bgColor
        )}>
          <div className={cn(
            "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            step.color
          )}></div>
          <Icon className="w-8 h-8 text-foreground relative z-10" />
          
          {/* Step number badge */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold">
            {step.id}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-center space-y-3">
        <h3 className="text-xl font-semibold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-foreground group-hover:to-foreground/70 transition-all duration-300">
          {step.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {step.description}
        </p>
        <div className="pt-2">
          <span className="text-xs text-muted-foreground/70 italic">
            {step.details}
          </span>
        </div>
      </div>

             {/* Connector Arrow (Desktop only) */}
       {!mobile && index < STEPS.length - 1 && (
         <div className="hidden lg:block absolute top-8 -right-4 z-20">
           <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
         </div>
       )}
    </div>
  );
};

export default HowItWorks; 