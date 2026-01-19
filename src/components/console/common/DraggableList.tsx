import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useId } from "react";

import icDrag from "@/assets/images/console/icDrag.svg";

interface DraggableListProps<T, D extends Record<string, unknown> = Record<string, unknown>> {
    items: T[];
    renderRow: (item: T, index: number) => React.ReactNode;
    getItemId: (item: T, index: number) => string | number;
    getItemData?: (item: T, index: number) => D;
    handleChangeOrder: (event: DragEndEvent) => void;
}

export default function DraggableList<T, D extends Record<string, unknown> = Record<string, unknown>>({
    items,
    renderRow,
    getItemId,
    getItemData,
    handleChangeOrder,
}: DraggableListProps<T, D>) {
    // DndContext 에 고유id 추가 (ssr에러 해결)
    const id = useId();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        handleChangeOrder(event);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            id={id}
            modifiers={[restrictToParentElement]}
        >
            <ul className="flex flex-col gap-[8px]">
                <SortableContext items={items.map(getItemId)} strategy={verticalListSortingStrategy}>
                    {items.map((item, i) => (
                        <DraggableRow
                            key={getItemId(item, i)}
                            id={getItemId(item, i)}
                            data={getItemData ? getItemData(item, i) : undefined}
                        >
                            {renderRow(item, i)}
                        </DraggableRow>
                    ))}
                </SortableContext>
            </ul>
        </DndContext>
    );
}

function DraggableRow({
    id,
    children,
    data,
}: {
    id: string | number;
    children: React.ReactNode;
    data?: Record<string, unknown>;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, data });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li ref={setNodeRef} style={style} className="group relative">
            <button
                type="button"
                className="absolute left-[8px] top-1/2 -translate-y-1/2 cursor-grab opacity-0 transition-all group-hover:opacity-100"
                {...attributes}
                {...listeners}
            >
                <Image src={icDrag} alt="순서변경" className="mx-auto" />
            </button>
            {children}
        </li>
    );
}
