export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Blink Protocol";

export const APP_DOMAIN = `https://${process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000"}`;

export const APP_HOSTNAMES = new Set([
    process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000",
    `www.${process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000"}`,
]);

// KYC Platform specific constants
export const KYC_PLATFORM_NAME = "Blink Protocol";
export const KYC_PLATFORM_TAGLINE = "Verify Once, Use Everywhere";
export const KYC_PLATFORM_DESCRIPTION = "Privacy-preserving identity verification that works across all platforms";
