"use client";

import React from "react";
import { motion } from "framer-motion";
import Container from "../global/container";
import { SectionBadge } from "../ui/section-bade";
import { 
  Coins, 
  Building2, 
  Gamepad2, 
  Heart, 
  Smartphone, 
  ArrowRight,
  Clock,
  Users,
  Zap
} from "lucide-react";
import { cn } from "@/functions/cn";

const USE_CASES = [
  {
    id: 1,
    icon: Coins,
    title: "DeFi & Web3",
    industry: "Decentralized Finance",
    description: "Enable compliant DeFi access without compromising privacy. Users verify once and access any DeFi protocol.",
    examples: [
      "Uniswap pool participation",
      "Aave lending platform",
      "Compound protocol access",
      "DEX trading compliance"
    ],
    stats: { time: "5min", reduction: "90%", users: "10K+" },
    color: "from-orange-500 to-yellow-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  },
  {
    id: 2,
    icon: Building2,
    title: "Traditional Finance",
    industry: "Banking & Fintech",
    description: "Streamline customer onboarding for banks, fintech apps, and payment processors with reusable KYC.",
    examples: [
      "Digital bank accounts",
      "Investment platforms",
      "Payment processing",
      "Credit applications"
    ],
    stats: { time: "2min", reduction: "85%", users: "25K+" },
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    id: 3,
    icon: Gamepad2,
    title: "Gaming & NFTs",
    industry: "Gaming Industry",
    description: "Age verification and compliance for gaming platforms, NFT marketplaces, and virtual worlds.",
    examples: [
      "NFT marketplace trading",
      "In-game asset purchases",
      "Tournament participation",
      "Virtual world access"
    ],
    stats: { time: "3min", reduction: "80%", users: "15K+" },
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    id: 4,
    icon: Heart,
    title: "Healthcare",
    industry: "Medical Services",
    description: "HIPAA-compliant identity verification for telemedicine, health apps, and medical record access.",
    examples: [
      "Telemedicine consultations",
      "Prescription verification",
      "Health record access",
      "Insurance claims"
    ],
    stats: { time: "4min", reduction: "75%", users: "8K+" },
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  {
    id: 5,
    icon: Smartphone,
    title: "Mobile Apps",
    industry: "App Development",
    description: "SDK integration for mobile apps requiring age verification, identity confirmation, or compliance.",
    examples: [
      "Social media platforms",
      "Dating applications",
      "Ride-sharing services",
      "E-commerce platforms"
    ],
    stats: { time: "1min", reduction: "95%", users: "50K+" },
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20"
  }
];

const UseCases = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      
      <Container>
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <SectionBadge title="Use Cases" />
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold !leading-tight mt-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            One KYC, Infinite Possibilities
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground mt-6 leading-relaxed"
          >
            See how leading companies across industries are using Universal KYC to streamline compliance and enhance user experience.
          </motion.p>
        </div>
      </Container>

      <Container>
        <div className="mt-16 w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {USE_CASES.map((useCase, index) => (
              <motion.div
                key={useCase.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={cn(
                  "group relative p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-105 cursor-pointer",
                  useCase.borderColor,
                  useCase.bgColor,
                  "hover:shadow-2xl"
                )}
              >
                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br transition-all duration-300 group-hover:scale-110",
                    useCase.color
                  )}>
                    <useCase.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.industry}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {useCase.description}
                </p>

                {/* Examples */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Common Use Cases:</h4>
                  <ul className="space-y-2">
                    {useCase.examples.map((example, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">{useCase.stats.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Setup</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Zap className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">{useCase.stats.reduction}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Faster</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">{useCase.stats.users}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Users</p>
                    </div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
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
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Ready to integrate? Start with our SDK</span>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default UseCases; 