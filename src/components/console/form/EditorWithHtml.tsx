"use client";

import { Editor } from "@/components/blocks/editor-x/editor";
import Tabs from "@/components/console/common/Tabs";

import MonacoHtmlEditor from "./MonacoHtmlEditor";

interface EditorWithHtmlProps {
    type: "E" | "H";
    editorValue: string;
    htmlValue: string;
    onChangeEditorValue: (content: string) => void;
    onChangeHtmlValue: (content: string) => void;
    onTypeChange: (type: "E" | "H") => void;
    placeholder?: string;
    htmlClassName?: string;
    editorClassName?: string;
}

export default function EditorWithHtml({
    type,
    editorValue,
    htmlValue,
    onChangeEditorValue,
    onChangeHtmlValue,
    onTypeChange,
    placeholder: _placeholder,
    htmlClassName,
    editorClassName: _editorClassName,
}: EditorWithHtmlProps) {
    return (
        <>
            <Tabs
                list={["에디터", "HTML"]}
                activeIdx={type === "H" ? 1 : 0}
                handleClick={idx => onTypeChange(idx === 1 ? "H" : "E")}
            />
            <div className={`${type === "H" ? "" : "hidden"}`}>
                <MonacoHtmlEditor
                    value={htmlValue}
                    onChange={val => {
                        onChangeHtmlValue(val);
                    }}
                    className={htmlClassName}
                />
            </div>
            <div className={`${type === "H" ? "hidden" : ""}`}>
                <Editor htmlValue={editorValue || ""} onHtmlChange={onChangeEditorValue} />
            </div>
        </>
    );
}
