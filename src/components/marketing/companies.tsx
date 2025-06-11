import React from "react";
import Image from "next/image";
import Marquee from "../ui/marquee";

const Companies = () => {
    return (
        <div className="flex w-full py-20">
            <div className="flex flex-col items-center justify-center text-center w-full py-2">
                <h2 className="text-xl heading">
                    Our Partners and Backers
                </h2>
                <div className="mt-16 w-full relative overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:30s]">
                        <div className="flex gap-8 md:gap-12">
                            <Image src="/bff.avif" alt="VDEX Logo" width={96} height={96} className="w-24 h-8" />
                            <Image src="/binance.png" alt="VDEX Logo" width={96} height={96} className="w-24 h-8" />
                            <Image src="/bitlayer.avif" alt="VDEX Logo" width={96} height={96} className="w-24 h-8" />
                            <Image src="/byz.png" alt="VDEX Logo" width={96} height={96} className="w-24 h-8" />
                            <Image src="/gateio.avif" alt="VDEX Logo" width={96} height={96} className="w-24 h-8" />
                            <Image src="/inception.webp" alt="VDEX Logo" width={96} height={72} className="w-24 h-18" />
                            <Image src="/near.avif" alt="VDEX Logo" width={96} height={96} className="w-24 h-8" />
                            <Image src="/nibiru.svg" alt="VDEX Logo" width={96} height={96} className="w-24 h-8" />
                        </div>
                    </Marquee>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
                </div>
            </div>
        </div>
    )
};

export default Companies
