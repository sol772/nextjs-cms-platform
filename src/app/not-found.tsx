"use client";

import { usePathname } from "next/navigation";

export default function NotFound() {
    const pathname = usePathname();
    const isConsolePath = pathname?.startsWith("/console");
    const mainLink = isConsolePath ? "/console/main" : "/";
    const linkText = isConsolePath ? "관리자 메인으로 돌아가기" : "메인으로 돌아가기";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        window.location.href = mainLink;
    };

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-[#F6F7FA]">
            <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold text-gray-800">페이지를 찾을 수 없습니다</h2>
                <p className="mb-6 text-gray-600">요청하신 페이지가 존재하지 않습니다.</p>
                <button
                    onClick={handleClick}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                    {linkText}
                </button>
            </div>
        </div>
    );
}
