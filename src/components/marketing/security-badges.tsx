"use client";

import React from "react";
import { motion } from "framer-motion";
import Container from "../global/container";
import { SectionBadge } from "../ui/section-bade";
import { Shield, Lock, Eye, Globe, CheckCircle, Award } from "lucide-react";
import { cn } from "@/functions/cn";

const SECURITY_STANDARDS = [
  {
    icon: Shield,
    title: "SOC 2 Type II",
    description: "Security controls and compliance verified by independent auditors",
    status: "Certified",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  {
    icon: Lock,
    title: "ISO 27001",
    description: "International standard for information security management",
    status: "Compliant",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    icon: Eye,
    title: "GDPR Ready",
    description: "Full compliance with European data protection regulations",
    status: "Verified",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    icon: Globe,
    title: "CCPA Compliant",
    description: "California Consumer Privacy Act compliance for US users",
    status: "Active",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  }
];

const SECURITY_FEATURES = [
  "AES-256 Client-Side Encryption",
  "Zero-Knowledge Architecture",
  "Multi-Signature Wallet Support",
  "Decentralized Storage",
  "Tamper-Proof Attestations",
  "End-to-End Verification"
];

const SecurityBadges = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <Container>
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <SectionBadge title="Security & Compliance" />
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold !leading-tight mt-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Enterprise-Grade Security
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground mt-6 leading-relaxed"
          >
            Your data is protected by industry-leading security standards and compliance frameworks trusted by Fortune 500 companies.
          </motion.p>
        </div>
      </Container>

      <Container>
        <div className="mt-16 w-full max-w-6xl mx-auto">
          {/* Security Standards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {SECURITY_STANDARDS.map((standard, index) => (
              <motion.div
                key={standard.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={cn(
                  "relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105",
                  standard.borderColor,
                  standard.bgColor
                )}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <standard.icon className={cn("w-12 h-12", standard.color)} />
                    <div className="absolute -top-1 -right-1">
                      <CheckCircle className="w-5 h-5 text-green-500 bg-background rounded-full" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{standard.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{standard.description}</p>
                    <div className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
                      standard.bgColor,
                      standard.color
                    )}>
                      <CheckCircle className="w-3 h-3" />
                      {standard.status}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-muted/30 rounded-2xl p-8 border border-border"
          >
            <div className="text-center mb-8">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Security Architecture</h3>
              <p className="text-muted-foreground">Built with privacy-first principles and cutting-edge cryptography</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECURITY_FEATURES.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default SecurityBadges; 