import "./globals.css";

import type { Metadata } from "next";

import QueryProvider from "@/components/common/common/QueryProvider";
import { fetchSiteMetadata } from "@/lib/fetchSiteMetadata";

// 동적 메타데이터 생성
export async function generateMetadata(): Promise<Metadata> {
    return await fetchSiteMetadata();
}

export const viewport = {
    width: "device-width",
    initialScale: 1.0,
    maximumScale: 1.0,
    userScalable: false,
    themeColor: "#000000",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body>
                <QueryProvider>{children}</QueryProvider>
                <div id="modal-root" />
            </body>
        </html>
    );
}
