"use client";

import { useEffect, useState } from "react";

import { SelectItem } from "@/components/console/form/SelectBox";
import { useGetLevelList } from "@/service/console/setting/level";

interface Level {
    l_level: number;
    l_name: string | null;
}

// 사용가능한 회원등급 옵션 목록
export const useLevelSelectOptions = () => {
    const [levelOptions, setLevelOptions] = useState<SelectItem[]>([]);
    const { data: configData } = useGetLevelList();

    useEffect(() => {
        if (configData) {
            const data = configData.data;
            const filtered = data.filter((item: Level) => item.l_name);
            const list = filtered.map((item: Level) => ({ value: item.l_level.toString(), label: item.l_name }));
            setLevelOptions(list);
        }
    }, [configData]);

    return {
        levelOptions,
    };
};