import { Metadata } from "next";

interface MetadataProps {
    title?: string;
    description?: string;
    image?: string | null;
    icons?: Metadata["icons"];
    noIndex?: boolean;
    keywords?: string[];
    author?: string;
    twitterHandle?: string;
    type?: "website" | "article" | "profile";
    locale?: string;
    alternates?: Record<string, string>;
    publishedTime?: string;
    modifiedTime?: string;
}

export const generateMetadata = ({
    title = `${process.env.NEXT_PUBLIC_APP_NAME} - The Omnichain PerpDex`,
    description = "The Omnichain Perpetual Decentralized Exchange",
    image = "/vdexhero.png",
    icons = [
        {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            url: "https://4101695250-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FXaqXFw9hEdwD1MWWRwfI%2Fuploads%2FsFrzjyn2hwFo9xxbgz5I%2FVDEX%20FINAL%20logo.png?alt=media&token=dbfc99d4-f94c-4088-b6fd-85840b430c17"
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            url: "https://4101695250-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FXaqXFw9hEdwD1MWWRwfI%2Fuploads%2FsFrzjyn2hwFo9xxbgz5I%2FVDEX%20FINAL%20logo.png?alt=media&token=dbfc99d4-f94c-4088-b6fd-85840b430c17"
        },
    ],
    noIndex = false,
    keywords = [
        "PerpDex",
        "Perpetual Decentralized Exchange",
        "Decentralized Exchange",
        "Perpetual Swap",
        "Perpetual Futures",
        "Perpetual Options",
        "Perpetual Swaps",
        "Perpetual Options",
        "Perpetual Futures",
        "Perpetual Swaps",
        "Perpetual Options",
        "Perpetual Futures",
    ],
    author = process.env.NEXT_PUBLIC_AUTHOR_NAME,
    twitterHandle = "@yourtwitterhandle",
    type = "website",
    locale = "en_US",
    alternates = {},
    publishedTime,
    modifiedTime
}: MetadataProps = {}): Metadata => {
    const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL || "https://vdex-landing-page.vercel.app");
    const imageUrl = image ? new URL(image, metadataBase).toString() : null;

    return {
        metadataBase,
        title: {
            template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
            default: title
        },
        description,
        keywords,
        authors: [{ name: author }],
        creator: author,
        publisher: process.env.NEXT_PUBLIC_APP_NAME,
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        icons,

        // OpenGraph
        openGraph: {
            type,
            siteName: process.env.NEXT_PUBLIC_APP_NAME,
            title,
            description,
            ...(imageUrl && {
                images: [{
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title
                }]
            }),
            locale,
            alternateLocale: Object.keys(alternates),
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime })
        },

        // Twitter
        twitter: {
            card: imageUrl ? "summary_large_image" : "summary",
            site: twitterHandle,
            creator: twitterHandle,
            title,
            description,
            ...(imageUrl && { images: [imageUrl] })
        },

        // Robots
        robots: {
            index: !noIndex,
            follow: !noIndex,
            googleBot: {
                index: !noIndex,
                follow: !noIndex,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        // Verification
        verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
            yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
            yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
        },
    };
};