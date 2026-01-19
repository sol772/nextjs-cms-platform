import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // Next.js 16: serverComponentsExternalPackages가 최상위로 이동
    serverExternalPackages: [],
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: process.env.NEXT_PUBLIC_API_HOSTNAME || "api.example.com",
            },
        ],
    },
    // webpack 설정 수정
    webpack: (config, { isServer, dev }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }

        // 개발 모드에서 webpack 최적화 비활성화
        if (dev) {
            config.optimization = {
                ...config.optimization,
                splitChunks: false,
            };
        }

        return config;
    },
    async headers() {
        return [
            // Next.js 정적 자산 (해시가 포함된 파일) - 영구 캐시
            // Next.js는 기본적으로 청크 파일에 해시를 포함하므로 안전하게 영구 캐시 가능
            {
                source: "/_next/static/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
            // HTML 페이지는 캐시하지 않음 (Next.js 기본 권장사항)
            // HTML이 변경되면 새로운 청크 파일을 참조하므로 자동으로 새 버전 로드
            {
                source: "/",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=0, must-revalidate",
                    },
                ],
            },
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=0, must-revalidate",
                    },
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
