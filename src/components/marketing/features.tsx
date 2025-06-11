"use client";
import React from "react";
import Container from "../global/container";
import Icons from "../global/icons";
import Images from "../global/images";
import MagicCard from "../ui/magic-card";
import Image from "next/image";
import { Ripple } from "../ui/ripple";
import { SectionBadge } from "../ui/section-bade";

const Features = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-24 w-full">
            <Container>
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                    <SectionBadge title="Why VDEX?" />
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mt-6">
                        Fast, secure, and fully decentralized trading.
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
                                        <Icons.stars className="w-20 h-20" />
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
                                    <div className="w-full h-40">
                                        <Images.analytics className="w-full h-full" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-xl font-heading font-medium heading ">
                                            Omnichain trading
                                        </h4>
                                        <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                            Trade across multiple blockchains from a single account without needing to bridge assets.
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
                                    <div className="w-full h-52 relative">
                                        <Images.hash className="w-full h-full" />
                                        <div className="w-40 h-40 rounded-full bg-secondary/10 blur-3xl -z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                    </div>
                                    <div className="flex flex-col mt-auto">
                                        <h4 className="text-xl font-heading font-medium heading">
                                            No KYC, No VPN Restrictions
                                        </h4>
                                        <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                            Trade Freely, Anywhere, Without Barriers
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
                                                VDEX is the decentralized exchange that delivers the best of both worlds — the speed and features of a CEX, with the security and freedom of a true DEX. Trade anytime, anywhere, with full self-custody and zero compromises.
                                            </p>
                                        </div>
                                        <div className="w-full h-16 relative">
                                            <div className="w-20 h-20 rounded-full bg-secondary/10 blur-2xl z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                <Icons.icon className="w-24 h-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80" />
                                                <Images.circlePallete className="w-full h-full opacity-30" />
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
                                        <h4 className="text-xl font-heading font-medium heading ">
                                            Full Self-Custody
                                        </h4>
                                        <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                            Your Funds, Your Control—Always
                                        </p>
                                    </div>
                                    <div className="w-full h-28 relative">
                                        <Images.integration className="w-full h-full" />
                                        <div className="w-28 h-28 rounded-full bg-secondary/10 blur-3xl -z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"></div>
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
                                    <div className="w-full">
                                        <Image src="/vdexhero.avif" alt="Bitcoin" width={96} height={96} className="w-full h-40 lg:h-auto" />
                                    </div>
                                    <div className="flex flex-col mt-auto">
                                        <h4 className="text-xl font-heading font-medium heading ">
                                            Sustainable BTC Yield
                                        </h4>
                                        <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                            Earn Safely on Your Bitcoin.
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
                                    <div className="w-full">
                                        <Images.ideation className="w-full h-40 lg:h-52" />
                                    </div>
                                    <div className="flex flex-col mt-auto">
                                        <h4 className="text-xl font-heading font-medium heading ">
                                            Sub-Millisecond Finality
                                        </h4>
                                        <p className="text-sm md:text-base mt-2 text-muted-foreground">
                                            Speed is critical in trading. Delayed execution can result in slippage, missed entries, or poor exits. VDEX achieves Sub-Millisecond Finality by bypassing blockchain confirmation delays.
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