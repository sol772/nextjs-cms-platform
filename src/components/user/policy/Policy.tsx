"use client";

import { useEffect, useState } from "react";

import ContentLayout from "@/components/user/layout/ContentLayout";
import { policyTypes } from "@/constants/user/policyTypes";
import { useGetPolicy } from "@/service/user/common";

interface PolicyItem {
    p_title: string;
    p_contents: string;
}

interface PolicyProps {
    policyType: string;
}

export default function Policy({ policyType }: PolicyProps) {
    const [policyIdx, setPolicyIdx] = useState<number | null>(null);
    const [contents, setContents] = useState<PolicyItem>({ p_title: "", p_contents: "" });
    const { data: configData } = useGetPolicy(policyIdx?.toString() || "", { enabled: !!policyIdx });

    useEffect(() => {
        if (policyType) {
            setPolicyIdx(policyTypes.find(policy => policy.type === policyType)?.idx || null);
        } else {
            setPolicyIdx(null);
        }
    }, [policyType]);

    useEffect(() => {
        if (configData) {
            setContents(configData.data);
        }
    }, [configData]);

    return (
        <ContentLayout>
            <div className="flex flex-col gap-[30px]">
                <p className="text-center text-[20px] font-[700] md:text-[24px]">{contents.p_title}</p>
                <div dangerouslySetInnerHTML={{ __html: contents.p_contents }} />
            </div>
        </ContentLayout>
    );
}
