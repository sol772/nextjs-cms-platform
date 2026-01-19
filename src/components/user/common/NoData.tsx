"use client";

import { useTranslations } from "next-intl";

export default function NoData() {
    const t = useTranslations("Common");

    return (
        <div className="flex h-[400px] w-full flex-col items-center justify-center border-4 border-[#F2F3F8]">
            <p className="text-primary-2 text-[20px] font-[700] md:text-[24px]">{t("noData")}</p>
        </div>
    );
}
