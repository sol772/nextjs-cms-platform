import { defaultMetadata } from "@/constants/common/metadata";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export async function fetchSiteMetadata(language: string = "KR") {
    try {
        const response = await fetch(`${API_BASE_URL}/v1/main/config/site/likeweb/${language}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
                "Accept-Encoding": "gzip, deflate, br",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.log(`[메타데이터] API 응답 실패: ${response.status} ${response.statusText}`);
            return defaultMetadata;
        }

        const result = await response.json();
        const siteInfo = result?.data;

        if (!siteInfo) {
            return defaultMetadata;
        }

        const { c_site_name, c_b_title, c_meta, c_meta_tag } = siteInfo;
        return {
            metadataBase: new URL(SITE_URL),
            title: c_b_title || defaultMetadata.title,
            description: c_meta || defaultMetadata.description,
            keywords: c_meta_tag || defaultMetadata.keywords,
            authors: [{ name: c_site_name || defaultMetadata.title }],
            robots: "index,follow",
            openGraph: {
                type: "website",
                url: SITE_URL,
                title: c_b_title || defaultMetadata.title,
                description: c_meta || defaultMetadata.description,
                siteName: c_site_name || defaultMetadata.title,
                images: ["/og-image.jpg"],
            },
            twitter: {
                card: "summary",
                title: c_b_title || defaultMetadata.title,
                description: c_meta || defaultMetadata.description,
                images: ["/og-image.jpg"],
            },
            other: {
                "X-UA-Compatible": "IE=edge",
            },
        };
    } catch (error) {
        // 빌드 타임 정적 생성 시 발생하는 에러는 무시 (런타임에서 정상 동작)
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes("Dynamic server usage")) {
            console.log(`[메타데이터] 에러: ${error}`);
        }
        return defaultMetadata;
    }
}