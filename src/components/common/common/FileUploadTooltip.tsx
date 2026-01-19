"use client";

import { useTranslations } from "next-intl";

import TooltipBox from "./TooltipBox";

export default function FileUploadTooltip() {
    const t = useTranslations("FileUpload");
    return <TooltipBox text={t("tooltip")} />;
}
