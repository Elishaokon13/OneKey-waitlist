"use client";

import React from "react";
import { motion } from "framer-motion";
import Container from "../global/container";
import { SectionBadge } from "../ui/section-bade";
import { CheckCircle, X, Clock, DollarSign, Shield, Zap, Users, Globe } from "lucide-react";
import { cn } from "@/functions/cn";

const COMPARISON_DATA = [
  {
    feature: "Verification Time",
    icon: Clock,
    traditional: {
      value: "3-5 days",
      available: true,
      description: "Multiple verifications for each platform"
    },
    universal: {
      value: "5 minutes",
      available: true,
      description: "One-time verification, instant reuse"
    }
  },
  {
    feature: "Cost per Verification",
    icon: DollarSign,
    traditional: {
      value: "$5-15",
      available: true,
      description: "Repeated costs for each platform"
    },
    universal: {
      value: "$3-5",
      available: true,
      description: "Single verification cost"
    }
  },
  {
    feature: "Data Privacy",
    icon: Shield,
    traditional: {
      value: "Stored centrally",
      available: false,
      description: "PII stored on multiple servers"
    },
    universal: {
      value: "Zero PII storage",
      available: true,
      description: "Client-side encryption, no data retention"
    }
  },
  {
    feature: "Cross-Platform Use",
    icon: Globe,
    traditional: {
      value: "Not available",
      available: false,
      description: "Separate KYC for each service"
    },
    universal: {
      value: "Universal access",
      available: true,
      description: "Works across all integrated platforms"
    }
  },
  {
    feature: "User Control",
    icon: Users,
    traditional: {
      value: "Limited",
      available: false,
      description: "Data controlled by service providers"
    },
    universal: {
      value: "Full control",
      available: true,
      description: "User decides who accesses their data"
    }
  },
  {
    feature: "Integration Speed",
    icon: Zap,
    traditional: {
      value: "2-4 weeks",
      available: true,
      description: "Complex API integrations"
    },
    universal: {
      value: "< 1 day",
      available: true,
      description: "Simple SDK integration"
    }
  }
];

const BENEFITS = [
  {
    title: "90% Faster",
    description: "User onboarding",
    icon: Zap,
    color: "text-blue-500"
  },
  {
    title: "85% Cost Reduction",
    description: "Verification expenses",
    icon: DollarSign,
    color: "text-green-500"
  },
  {
    title: "100% Privacy",
    description: "Zero PII storage",
    icon: Shield,
    color: "text-purple-500"
  },
  {
    title: "Universal Access",
    description: "Cross-platform identity",
    icon: Globe,
    color: "text-orange-500"
  }
];

const ComparisonTable = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <Container>
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <SectionBadge title="Why Choose Universal KYC" />
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold !leading-tight mt-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Traditional KYC vs Universal KYC
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground mt-6 leading-relaxed"
          >
            See how our innovative approach transforms identity verification and delivers superior results.
          </motion.p>
        </div>
      </Container>

      <Container>
        <div className="mt-16 w-full max-w-6xl mx-auto">
          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {BENEFITS.map((benefit, index) => (
              <div key={benefit.title} className="text-center p-6 bg-muted/30 rounded-xl border border-border">
                <benefit.icon className={cn("w-8 h-8 mx-auto mb-4", benefit.color)} />
                <h3 className="text-2xl font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-background border border-border rounded-2xl overflow-hidden"
          >
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-border">
              <div className="p-6 bg-muted/20">
                <h3 className="text-lg font-semibold text-foreground">Feature</h3>
              </div>
              <div className="p-6 bg-muted/10 border-l border-border">
                <h3 className="text-lg font-semibold text-foreground">Traditional KYC</h3>
                <p className="text-sm text-muted-foreground mt-1">Current industry standard</p>
              </div>
              <div className="p-6 bg-primary/5 border-l border-border">
                <h3 className="text-lg font-semibold text-primary">Universal KYC</h3>
                <p className="text-sm text-primary/70 mt-1">Our innovative solution</p>
              </div>
            </div>

            {/* Table Rows */}
            {COMPARISON_DATA.map((row, index) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-border last:border-b-0"
              >
                {/* Feature Column */}
                <div className="p-6 flex items-center gap-3">
                  <row.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-foreground">{row.feature}</span>
                </div>

                {/* Traditional KYC Column */}
                <div className="p-6 border-l border-border bg-muted/5">
                  <div className="flex items-center gap-2 mb-2">
                    {row.traditional.available ? (
                      <CheckCircle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium text-foreground">{row.traditional.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{row.traditional.description}</p>
                </div>

                {/* Universal KYC Column */}
                <div className="p-6 border-l border-border bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    {row.universal.available ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium text-primary">{row.universal.value}</span>
                  </div>
                  <p className="text-xs text-primary/70">{row.universal.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Make the Switch?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of developers and businesses who have already upgraded to Universal KYC. 
                Experience faster verification, enhanced privacy, and seamless cross-platform integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Start Free Trial
                </button>
                <button className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted/50 transition-colors">
                  Schedule Demo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default ComparisonTable; 