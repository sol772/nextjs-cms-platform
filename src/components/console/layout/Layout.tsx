"use client";

import "@/assets/css/console/console.css";

import { Suspense } from "react";

import ScrollToTop from "@/components/common/common/ScrollToTop";
import ConsoleToaster from "@/components/console/common/ConsoleToaster";
import Header from "@/components/console/layout/Header";
import LoadingPop from "@/components/console/popup/LoadingPop";
import ConsolePopup from "@/components/console/popup/Popup";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import Nav from "./-components/Nav";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ScrollToTop />
            <div className="flex h-screen bg-[#F6F7FA]" id="content_top">
                <Nav />
                <ScrollArea className="h-full w-[calc(100%-260px)]">
                    <Suspense fallback={<LoadingPop />}>
                        <div className="min-w-[1400px]">
                            <Header />
                            {children}
                        </div>
                    </Suspense>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            <ConsoleToaster />
            <ConsolePopup />
        </>
    );
}
