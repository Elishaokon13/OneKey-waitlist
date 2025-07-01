"use client";
import React from "react";
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
        <div className="flex flex-col items-center text-center w-full max-w-[90rem] mt-24 sm:mt-28 md:mt-32 lg:mt-36 xl:mt-40 mb-8 sm:mb-12 md:mb-16 lg:mb-20 mx-auto z-40 relative px-3 sm:px-4 md:px-6 lg:px-8">
            <Container delay={0.0}>
                <div className="pl-2 pr-1 py-1 rounded-full border border-foreground/10 hover:border-foreground/15 backdrop-blur-lg cursor-pointer flex items-center gap-1.5 sm:gap-2 select-none w-max mx-auto">
                    <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-primary/40 flex items-center justify-center relative">
                        <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping">
                            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping"></div>
                        </div>
                        <div className="w-0.75 h-0.75 xs:w-1 xs:h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                    <span className="inline-flex items-center justify-center gap-1.5 sm:gap-2 animate-text-gradient animate-background-shine bg-gradient-to-r from-[#b2a8fd] via-[#8678f9] to-[#c7d2fe] bg-[200%_auto] bg-clip-text text-[0.65rem] xs:text-xs sm:text-sm text-transparent">
                        Privacy-First Identity Verification
                    </span>
                </div>
            </Container>
            <BlurText
                word={KYC_PLATFORM_TAGLINE}
                className="text-3xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent py-1 sm:py-2 md:py-0 lg:!leading-snug font-bold tracking-[-0.0125em] mt-3 sm:mt-4 md:mt-6"
            />
            <Container delay={0.1}>
                <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl mt-2 xs:mt-3 sm:mt-4 text-accent-foreground/60 max-w-[90%] xs:max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
                    {KYC_PLATFORM_DESCRIPTION}. Complete KYC once, use it everywhere with zero PII storage and user-controlled access.
                </p>
            </Container>
            <Container delay={0.2}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full">
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-3 py-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto max-w-[16rem] sm:max-w-[10rem] md:max-w-[12rem]"
                    >
                        <Link href="/kyc/verify" className="flex items-center justify-center gap-2">
                            <ShieldCheckIcon className="w-4 h-4" />
                            <span>Start Verification</span>
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-2 border-gray-300 hover:border-gray-400 hover:text-gray-900 font-medium px-3 py-2 transition-all duration-300 hover:scale-105 bg-transparent hover:bg-gray-50 text-white w-full sm:w-auto max-w-[16rem] sm:max-w-[9rem] md:max-w-[10rem]"
                    >
                        <Link href="/dashboard" className="hidden sm:flex items-center justify-center gap-2">
                            <KeyIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Explore Demo</span>
                        </Link>
                    </Button>
                </div>
            </Container>
            <Container delay={0.25}>
                <div className="hidden sm:flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                        <span className="whitespace-nowrap">Zero PII Storage</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <span className="whitespace-nowrap">Blockchain Secured</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                        <span className="whitespace-nowrap">User Controlled</span>
                    </div>
                </div>
            </Container>
            <Container delay={0.3}>
                <div className="relative mx-auto w-full max-w-[90%] xs:max-w-xs sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl rounded-lg sm:rounded-xl lg:rounded-2xl border border-neutral-200/50 p-1 sm:p-2 backdrop-blur-lg border-neutral-700 bg-neutral-800/50 md:p-3 mt-6 sm:mt-8 md:mt-10">
                    <div className="absolute top-1/4 left-1/2 -z-10 gradient w-full sm:w-3/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[4rem] sm:blur-[6rem] lg:blur-[8rem]"></div>
                    <div className="rounded-md sm:rounded-lg lg:rounded-2xl border p-1 sm:p-2 border-neutral-700 bg-black">
                        <div className="rounded-md sm:rounded-lg lg:rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 aspect-video flex items-center justify-center">
                            <div className="text-center space-y-2 sm:space-y-3 p-3 sm:p-4">
                                <ShieldCheckIcon className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto text-blue-400" />
                                <div>
                                    <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-white">Universal KYC Dashboard</h3>
                                    <p className="text-[0.65rem] xs:text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Secure, Private, Reusable</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Hero;