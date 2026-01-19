import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface ResizableSplitProps {
    left: React.ReactNode;
    right: React.ReactNode;
    leftDefaultSize?: number; // %
    rightDefaultSize?: number; // %
    minSize?: number; // %
    className?: string;
}

export default function ResizableSplit({
    left,
    right,
    leftDefaultSize = 50,
    rightDefaultSize = 50,
    minSize = 40,
    className = "",
}: ResizableSplitProps) {
    return (
        <PanelGroup direction="horizontal" className={className}>
            <Panel defaultSize={leftDefaultSize} minSize={minSize}>
                {left}
            </Panel>
            <PanelResizeHandle className="relative w-[6px] cursor-col-resize after:absolute after:left-1/2 after:top-0 after:h-full after:w-[2px] after:-translate-x-1/2 after:rounded-[2px] after:bg-white" />
            <Panel defaultSize={rightDefaultSize} minSize={minSize}>
                {right}
            </Panel>
        </PanelGroup>
    );
}
