import type { Metadata } from "next";

export const defaultMetadata = {
    metadataBase: new URL("https://basic.likeweb.co.kr/"),
    title: "기본솔루션",
    description: "기본솔루션",
    keywords: "기본솔루션",
    authors: [{ name: "기본솔루션" }],
    robots: "index,follow" as const,
    openGraph: {
        type: "website",
        url: "https://basic.likeweb.co.kr/",
        title: "기본솔루션",
        description: "기본솔루션",
        siteName: "기본솔루션",
        images: ["/og-image.jpg"],
    },
    twitter: {
        card: "summary" as const,
        title: "기본솔루션",
        description: "기본솔루션",
        images: ["/og-image.jpg"],
    },
    other: { "X-UA-Compatible": "IE=edge" },
} satisfies Metadata;