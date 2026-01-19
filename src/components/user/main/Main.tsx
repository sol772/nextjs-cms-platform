import UserPopup from "../popup/UserPopup";
import MainBanner from "./-components/MainBanner";

export default function Main() {
    return (
        <>
            <div className="min-h-screen">
                <MainBanner />
            </div>
            <UserPopup />
        </>
    );
}
