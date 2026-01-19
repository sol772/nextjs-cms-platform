import WindowPopup from "@/components/user/popup/WindowPopup";

export default async function PopupPage({
    params,
}: {
    params: Promise<{ popup_idx: string }>;
}) {
    const { popup_idx } = await params;
    return <WindowPopup popupIdx={popup_idx} />;
}
