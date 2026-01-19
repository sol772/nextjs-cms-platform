import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import Layout from "@/components/user/layout/Layout";
import Main from "@/components/user/main/Main";
import UserPopup from "@/components/user/popup/Popup";

export default async function Page() {
    const locale = await getLocale();
    const messages = await getMessages({ locale });

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <Layout>
                <Main />
            </Layout>
            <UserPopup />
        </NextIntlClientProvider>
    );
}
