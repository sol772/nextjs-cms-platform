import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ScrollToTop = () => {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window !== "undefined") {
        window.scrollTo(0, 0); // 경로가 변경될 때마다 스크롤을 맨 위로 이동
        }
    }, [pathname]);

    return null;
};

export default ScrollToTop;
