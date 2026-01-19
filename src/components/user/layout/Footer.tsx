"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { policyTypes } from "@/constants/user/policyTypes";
import { useSelectedLanguage } from "@/hooks/user/useSelectedLanguage";
import { useGetPolicyList } from "@/service/user/common";
import { SiteInfoItem } from "@/store/common/useSiteStore";

interface PolicyItem {
    idx: number;
    p_title: string;
    p_use_yn: string;
    type: string;
}

interface FooterProps {
    siteInfo: SiteInfoItem;
}

export default function Footer({ siteInfo }: FooterProps) {
    const t = useTranslations("Footer");
    const selectedLanguage = useSelectedLanguage();
    const pathname = usePathname();
    const [policyList, setPolicyList] = useState<PolicyItem[]>([]);
    const { data: configData } = useGetPolicyList(selectedLanguage, pathname, {
        enabled: !!selectedLanguage && !!pathname,
    });

    useEffect(() => {
        if (configData) {
            const { data_list } = configData.data;
            const list = data_list.filter((item: PolicyItem) => item.p_use_yn === "Y");
            const listWithLink = list.map((item: PolicyItem) => ({
                ...item,
                type: policyTypes.find(policy => policy.idx === item.idx)?.type || "",
            }));
            setPolicyList(listWithLink);
        }
    }, [configData]);

    return (
        <footer className="bg-[#F2F2F2] p-[20px] md:p-[40px_28px] xl:py-[60px]">
            <div className="mx-auto flex max-w-[1360px] flex-col gap-[20px]">
                <Link href="/" className="w-fit md:text-[18px]">
                    {siteInfo.c_site_name}
                </Link>
                <ul className="flex flex-col gap-[8px]">
                    {siteInfo.c_ceo && (
                        <li className="flex items-center md:text-[18px]">
                            <p className="min-w-[120px] text-[#666]">{t("ceo")}</p>
                            <p className="flex-1">{siteInfo.c_ceo}</p>
                        </li>
                    )}
                    {siteInfo.c_tel && (
                        <li className="flex items-center md:text-[18px]">
                            <p className="min-w-[120px] text-[#666]">{t("representativePhone")}</p>
                            <p className="flex-1">{siteInfo.c_tel}</p>
                        </li>
                    )}
                    {siteInfo.c_num && (
                        <li className="flex items-center md:text-[18px]">
                            <p className="min-w-[120px] text-[#666]">{t("businessNumber")}</p>
                            <p className="flex-1">{siteInfo.c_num}</p>
                        </li>
                    )}
                    {siteInfo.c_num2 && (
                        <li className="flex items-center md:text-[18px]">
                            <p className="min-w-[120px] text-[#666]">{t("onlineSalesNumber")}</p>
                            <p className="flex-1">{siteInfo.c_num2}</p>
                        </li>
                    )}
                    {siteInfo.c_email && (
                        <li className="flex md:text-[18px]">
                            <p className="min-w-[120px] text-[#666]">{t("email")}</p>
                            <p className="flex-1">{siteInfo.c_email}</p>
                        </li>
                    )}
                    {siteInfo.c_address && (
                        <li className="flex md:text-[18px]">
                            <p className="min-w-[120px] text-[#666]">{t("address")}</p>
                            <p className="flex-1">{siteInfo.c_address}</p>
                        </li>
                    )}
                    {siteInfo.c_fax && (
                        <li className="flex md:text-[18px]">
                            <p className="min-w-[120px] text-[#666]">{t("faxNumber")}</p>
                            <p className="flex-1">{siteInfo.c_fax}</p>
                        </li>
                    )}
                </ul>
                <ul className="flex flex-col gap-[8px] md:flex-row md:gap-[20px]">
                    {policyList.map(policy => (
                        <li key={policy.idx}>
                            <Link href={`/policy/${policy.type}`} className="text-[#666]">
                                {policy.p_title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    );
}
