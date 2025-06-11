import React from 'react';
import { ShieldCheckIcon, KeyIcon } from "lucide-react";
import Link from "next/link";
import { BlurText } from "../ui/blur-text";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import Container from "../global/container";
import { KYC_PLATFORM_NAME, KYC_PLATFORM_TAGLINE, KYC_PLATFORM_DESCRIPTION } from "@/constants";

const Hero = () => {
    return (
        <div className="flex flex-col items-center text-center w-full max-w-5xl my-24 mx-auto z-40 relative">
            <Container delay={0.0}>
                <div className="pl-2 pr-1 py-1 rounded-full border border-foreground/10 hover:border-foreground/15 backdrop-blur-lg cursor-pointer flex items-center gap-2.5 select-none w-max mx-auto">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary/40 flex items-center justify-center relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping"></div>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        </div>
                    </div>
                    <span className="inline-flex items-center justify-center gap-2 animate-text-gradient animate-background-shine bg-gradient-to-r from-[#b2a8fd] via-[#8678f9] to-[#c7d2fe] bg-[200%_auto] bg-clip-text text-sm text-transparent">
                        Privacy-First Identity Verification
                    </span>
                </div>
            </Container>
            <BlurText
                word={KYC_PLATFORM_TAGLINE}
                className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent py-2 md:py-0 lg:!leading-snug font-bold tracking-[-0.0125em] mt-6 font-heading"
            />
            <Container delay={0.1}>
                <p className="text-sm sm:text-base lg:text-lg mt-4 text-accent-foreground/60 max-w-2xl mx-auto">
                    {KYC_PLATFORM_DESCRIPTION}. Complete KYC once, use it everywhere with zero PII storage and user-controlled access.
                </p>
            </Container>
            <Container delay={0.2}>
                <div className="flex items-center justify-center gap-4 md:gap-x-6 mt-8">
                    <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Link href="/kyc/verify" className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-4 h-4" />
                            Start KYC Verification
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="flex items-center gap-2">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <KeyIcon className="w-4 h-4" />
                            Access Dashboard
                        </Link>
                    </Button>
                </div>
            </Container>
            <Container delay={0.25}>
                <div className="flex items-center justify-center gap-8 mt-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Zero PII Storage
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Blockchain Secured
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        User Controlled
                    </div>
                </div>
            </Container>
            <Container delay={0.3}>
                <div className="relative mx-auto max-w-7xl rounded-xl lg:rounded-[32px] border border-neutral-200/50 p-2 backdrop-blur-lg border-neutral-700 bg-neutral-800/50 md:p-4 mt-12">
                    <div className="absolute top-1/4 left-1/2 -z-10 gradient w-3/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[10rem]"></div>

                    <div className="rounded-lg lg:rounded-[24px] border p-2 border-neutral-700 bg-black">
                        {/* Placeholder for KYC Platform Screenshot */}
                        <div className="rounded-lg lg:rounded-[20px] bg-gradient-to-br from-blue-900/20 to-purple-900/20 aspect-video flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <ShieldCheckIcon className="w-16 h-16 mx-auto text-blue-400" />
                                <div>
                                    <h3 className="text-xl font-semibold text-white">Universal KYC Dashboard</h3>
                                    <p className="text-sm text-gray-400 mt-2">Secure, Private, Reusable</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
};

export default Hero
