import React from "react";
import Image from "next/image";
import Marquee from "../ui/marquee";

const Partners = () => {
    return (
        <div className="flex w-full py-20">
            <div className="flex flex-col items-center justify-center text-center w-full py-2">
                <h2 className="text-xl font-medium text-muted-foreground">
                    Powered by Industry Leaders
                </h2>
                <div className="mt-16 w-full relative overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:40s]">
                        <div className="flex gap-12 md:gap-16 items-center">
                            {/* Blockchain Networks */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">ETH</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Ethereum</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">POL</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Polygon</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-gray-300">
                                    <span className="text-white font-bold text-sm">AR</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Arweave</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">FIL</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Filecoin</span>
                            </div>
                            
                            {/* KYC Providers */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">SI</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Smile ID</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">ON</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Onfido</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">TR</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Trulioo</span>
                            </div>
                            
                            {/* Infrastructure Partners */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">LIT</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Lit Protocol</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-purple-700 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">PV</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Privy</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">EAS</span>
                                </div>
                                <span className="text-xs text-muted-foreground">EAS</span>
                            </div>
                        </div>
                    </Marquee>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
                </div>
            </div>
        </div>
    )
};

export default Partners
