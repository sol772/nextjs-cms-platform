"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
    children: ReactNode;
}

export default function Portal({ children }: PortalProps) {
    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPortalElement(document.getElementById("modal-root"));
    }, []);

    if (!portalElement) return null; // 서버 렌더링 시에는 아무것도 렌더링하지 않음

    return createPortal(children, portalElement);
}
