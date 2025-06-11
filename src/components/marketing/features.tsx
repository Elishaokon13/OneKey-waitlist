"use client";
import React from "react";
import Container from "../global/container";
import Icons from "../global/icons";
import Images from "../global/images";
import MagicCard from "../ui/magic-card";
import { ShieldCheckIcon, KeyIcon, LockIcon, RefreshCwIcon, UserCheckIcon, GlobeIcon } from "lucide-react";
import { Ripple } from "../ui/ripple";
import { SectionBadge } from "../ui/section-bade";

const Features = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full">
            <Container>
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                    <SectionBadge title="Why Universal KYC?" />
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mt-6">
                        Secure, private, and reusable identity verification.
                    </h2>
                </div>
            </Container>
            <div className="mt-16 w-full">
                <div className="flex flex-col items-center gap-5 lg:gap-5 w-full">
                    <Container>
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_.65fr] w-full gap-5 lg:gap-5">
                            <MagicCard 
                                particles={true} 
                                className="flex flex-col items-start size-full bg-[rgba(20,20,20,0.15)] !important:bg-[rgba(20,20,20,0.15)]"
                                style={{ backgroundColor: 'rgba(20, 20, 20, 0.15)' }}
                            >
                                <div className="bento-card flex items-center justify-center min-h-72">
                                    <span className="text-muted-foreground group-hover:text-foreground mx-auto relative">
                                        <ShieldCheckIcon className="w-20 h-20 text-blue-400" />
                                    </span>
                                    <Ripple />
                                </div>
                            </MagicCard>
                            <MagicCard 
                                particles={true} 
                                className="flex flex-col items-start w-full bg-[rgba(20,20,20,0.15)] !important:bg-[rgba(20,20,20,0.15)]"
                                style={{ backgroundColor: 'rgba(20, 20, 20, 0.15)' }}
                            >
                                <div className="bento-card w-full flex-row gap-6">
                                    <div className="w-full h-40 flex items-center justify-center">
                                        <div className="relative">
                                            <RefreshCwIcon className="w-16 h-16 text-purple-400 animate-spin animate-slow" />
                                            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl"></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-xl font-heading font-medium heading">
                                            One-Time Verification
                                        </h4>
                                        <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                            Complete KYC once and reuse verified attestations across all integrated platforms seamlessly.
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>
                        </div>
                    </Container>
                    <Container>
                        <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-5 lg:gap-5">
                            <MagicCard 
                                particles={true} 
                                className="flex flex-col items-start w-full row-span-1 bg-[rgba(20,20,20,0.15)] !important:bg-[rgba(20,20,20,0.15)]"
                                style={{ backgroundColor: 'rgba(20, 20, 20, 0.15)' }}
                            >
                                <div className="bento-card w-full flex-row gap-6">
                                    <div className="w-full h-52 relative flex items-center justify-center">
                                        <LockIcon className="w-24 h-24 text-green-400" />
                                        <div className="w-40 h-40 rounded-full bg-green-400/10 blur-3xl -z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                    </div>
                                    <div className="flex flex-col mt-auto">
                                        <h4 className="text-xl font-heading font-medium heading">
                                            Zero PII Storage
                                        </h4>
                                        <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                            Your personal data is encrypted client-side and never stored on our servers.
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>
                            <div className="grid grid-rows gap-5 lg:gap-5">
                                <MagicCard 
                                    particles={true} 
                                    className="flex flex-col items-start w-full row-span- row-start-[0.5] h-32 bg-[rgba(20,20,20,0.15)] !important:bg-[rgba(20,20,20,0.15)]"
                                    style={{ backgroundColor: 'rgba(20, 20, 20, 0.15)' }}
                                >
                                    <div className="bento-card w-full relative items-center justify-center">
                                        <div className="w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                            <p className="text-base text-muted-foreground text-justify [mask-image:radial-gradient(50%_50%_at_50%_50%,#BAB3FF_0%,rgba(186,179,255,0)_90.69%)]">
                                                Universal KYC Platform combines the security of blockchain technology with the privacy of client-side encryption. Complete verification once, maintain full control over your data, and prove your identity across any integrated service with zero PII exposure.
                                            </p>
                                        </div>
                                        <div className="w-full h-16 relative">
                                            <div className="w-20 h-20 rounded-full bg-secondary/10 blur-2xl z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                <ShieldCheckIcon className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 text-blue-400" />
                                            </div>
                                        </div>
                                    </div>
                                </MagicCard>
                            </div>
                            <MagicCard 
                                particles={true} 
                                className="flex flex-col items-start w-full row-span-1 bg-[rgba(20,20,20,0.15)] !important:bg-[rgba(20,20,20,0.15)]"
                                style={{ backgroundColor: 'rgba(20, 20, 20, 0.15)' }}
                            >
                                <div className="bento-card w-full flex-row gap-6">
                                    <div className="flex flex-col mb-auto">
                                        <h4 className="text-xl font-heading font-medium heading">
                                            User-Controlled Access
                                        </h4>
                                        <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                            You decide who can access your data and what information to share.
                                        </p>
                                    </div>
                                    <div className="w-full h-28 relative flex items-center justify-center">
                                        <KeyIcon className="w-16 h-16 text-purple-400" />
                                        <div className="w-28 h-28 rounded-full bg-purple-400/10 blur-3xl -z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"></div>
                                    </div>
                                </div>
                            </MagicCard>
                        </div>
                    </Container>
                    <Container>
                        <div className="grid grid-cols-1 lg:grid-cols-[.40fr_1fr] w-full gap-5 lg:gap-5">
                            <MagicCard 
                                particles={true} 
                                className="flex flex-col items-start w-full bg-[rgba(20,20,20,0.15)] !important:bg-[rgba(20,20,20,0.15)]"
                                style={{ backgroundColor: 'rgba(20, 20, 20, 0.15)' }}
                            >
                                <div className="bento-card w-full flex-row gap-6">
                                    <div className="w-full flex items-center justify-center h-40 lg:h-auto">
                                        <UserCheckIcon className="w-24 h-24 text-blue-400" />
                                    </div>
                                    <div className="flex flex-col mt-auto">
                                        <h4 className="text-xl font-heading font-medium heading">
                                            Multi-Provider Support
                                        </h4>
                                        <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                            Choose from Smile Identity, Onfido, Trulioo and more.
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>
                            <MagicCard 
                                particles={true} 
                                className="flex flex-col items-start w-full bg-[rgba(20,20,20,0.15)] !important:bg-[rgba(20,20,20,0.15)]"
                                style={{ backgroundColor: 'rgba(20, 20, 20, 0.15)' }}
                            >
                                <div className="bento-card w-full flex-row gap-6">
                                    <div className="w-full flex items-center justify-center h-40 lg:h-52">
                                        <GlobeIcon className="w-24 h-24 text-green-400" />
                                    </div>
                                    <div className="flex flex-col mt-auto">
                                        <h4 className="text-xl font-heading font-medium heading">
                                            Cross-Platform Integration
                                        </h4>
                                        <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                            Seamlessly integrate with any platform using our TypeScript SDK and REST API. Share verified identity across financial services, Web3 applications, and more with cryptographic proof and user consent.
                                        </p>
                                    </div>
                                </div>
                            </MagicCard>
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default Features;