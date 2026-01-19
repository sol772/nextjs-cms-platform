import Script from "next/script";
import { useEffect, useState } from "react";

import { useGetSubCategory } from "@/service/user/menu";

export default function Html({ category }: { category: string }) {
    const [tailwindLoaded, setTailwindLoaded] = useState(false);
    const { data: configData } = useGetSubCategory(category, {
        enabled: Boolean(category && tailwindLoaded),
    });

    useEffect(() => {
        setTailwindLoaded(false);
    }, [category]);

    useEffect(() => {
        if (configData?.data?.content && typeof window !== "undefined") {
            setTimeout(() => {
                // HTML에서 스크립트 태그 추출
                const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
                const scripts = configData.data.content.match(scriptRegex);

                if (scripts) {
                    // 스크립트 실행
                    scripts.forEach((scriptTag: string) => {
                        // 스크립트 내용 추출
                        const scriptContent = scriptTag.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "$1");

                        // 스크립트 실행
                        try {
                            // eslint-disable-next-line no-eval
                            eval(scriptContent);
                        } catch (error) {
                            console.error("Script execution error:", error);
                        }
                    });
                }
            }, 100);
        }
    }, [configData?.data?.content]);

    return (
        <>
            <Script
                src="https://cdn.tailwindcss.com"
                strategy="afterInteractive"
                onLoad={() => setTailwindLoaded(true)}
                onError={() => {
                    setTailwindLoaded(false);
                }}
            />
            {configData?.data?.content && (
                <div className="w-full" dangerouslySetInnerHTML={{ __html: configData.data.content }} />
            )}
        </>
    );
}
