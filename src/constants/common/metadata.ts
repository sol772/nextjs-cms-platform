import type { Metadata } from "next";

export const defaultMetadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://example.com"),
    title: "CMS Platform",
    description: "CMS Platform",
    keywords: "CMS Platform",
    authors: [{ name: "CMS Platform" }],
    robots: "index,follow" as const,
    openGraph: {
        type: "website",
        url: process.env.NEXT_PUBLIC_BASE_URL || "https://example.com",
        title: "CMS Platform",
        description: "CMS Platform",
        siteName: "CMS Platform",
        images: ["/og-image.jpg"],
    },
    twitter: {
        card: "summary" as const,
        title: "CMS Platform",
        description: "CMS Platform",
        images: ["/og-image.jpg"],
    },
    other: { "X-UA-Compatible": "IE=edge" },
} satisfies Metadata;