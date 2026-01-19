"use client";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { CollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $createParagraphNode, $getRoot, LexicalNode, TextNode } from "lexical";
import { $isDecoratorNode, $isElementNode, $isTextNode, EditorState, SerializedEditorState } from "lexical";
import { useEffect, useRef } from "react";

import { editorTheme } from "@/components/editor/themes/editor-theme";
import { TooltipProvider } from "@/components/ui/tooltip";

import { nodes } from "./nodes";
import { Plugins } from "./plugins";

const editorConfig: InitialConfigType = {
    namespace: "Editor",
    theme: editorTheme,
    nodes,
    onError: (error: Error) => {
        console.error(error);
    },
};

// DOM에서 텍스트 노드를 순서대로 수집하고 각 텍스트 노드가 속한 가장 가까운 인라인 스타일 요소의 스타일을 매핑
function collectTextNodesWithStyles(domRoot: HTMLElement): Array<{ text: string; style: string | null }> {
    const result: Array<{ text: string; style: string | null }> = [];
    const walker = document.createTreeWalker(domRoot, NodeFilter.SHOW_TEXT);

    let textNode: Node | null;
    while ((textNode = walker.nextNode())) {
        const text = textNode.textContent || "";
        if (!text.trim()) continue;

        // 텍스트 노드의 부모 요소 중 인라인 스타일이 있는 가장 가까운 요소 찾기
        let currentNode: Node | null = textNode;
        let style: string | null = null;

        while (currentNode && currentNode !== domRoot) {
            if (currentNode.nodeType === Node.ELEMENT_NODE) {
                const element = currentNode as HTMLElement;
                const inlineStyle = element.getAttribute("style");
                if (inlineStyle) {
                    style = inlineStyle;
                    break;
                }
            }
            currentNode = currentNode.parentNode;
        }

        result.push({ text, style });
    }

    return result;
}

// Lexical 노드 트리를 순회하며 텍스트 노드를 찾아 스타일 적용
function applyStylesToLexicalNodes(
    lexicalNode: LexicalNode,
    textNodesWithStyles: Array<{ text: string; style: string | null }>,
    index: { current: number },
): void {
    if ($isTextNode(lexicalNode)) {
        const textNode = lexicalNode as TextNode;
        if (index.current < textNodesWithStyles.length) {
            const { style } = textNodesWithStyles[index.current];
            if (style) {
                textNode.setStyle(style);
            }
            index.current++;
        }
    } else if ($isElementNode(lexicalNode)) {
        for (const child of lexicalNode.getChildren()) {
            applyStylesToLexicalNodes(child, textNodesWithStyles, index);
        }
    }
}

// DOM 트리를 재귀적으로 순회하며 인라인 스타일을 Lexical 노드에 적용
function preserveInlineStyles(domRoot: HTMLElement, lexicalNodes: LexicalNode[]): void {
    // DOM에서 텍스트 노드와 스타일 정보 수집
    const textNodesWithStyles = collectTextNodesWithStyles(domRoot);

    // Lexical 노드 트리를 순회하며 스타일 적용
    const index = { current: 0 };
    for (const lexicalNode of lexicalNodes) {
        applyStylesToLexicalNodes(lexicalNode, textNodesWithStyles, index);
    }
}

// HTML 문자열을 에디터에 설정하는 플러그인
function HtmlImportPlugin({
    htmlValue,
    isInternalUpdateRef,
    isImportingRef,
}: {
    htmlValue: string;
    isInternalUpdateRef: React.MutableRefObject<boolean>;
    isImportingRef: React.MutableRefObject<boolean>;
}) {
    const [editor] = useLexicalComposerContext();
    const lastHtmlValue = useRef<string>("");

    useEffect(() => {
        // 에디터 내부 변경으로 방금 전달된 htmlValue면 재-import 하지 않음
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            lastHtmlValue.current = htmlValue;
            return;
        }
        if (htmlValue === lastHtmlValue.current) return;
        lastHtmlValue.current = htmlValue;

        isImportingRef.current = true;
        const tid = setTimeout(() => {
            editor.update(
                () => {
                    const root = $getRoot();
                    root.clear();

                    if (htmlValue && htmlValue.trim()) {
                        const parser = new DOMParser();
                        const dom = parser.parseFromString(htmlValue, "text/html");
                        const body = dom.body;
                        const generatedNodes = $generateNodesFromDOM(editor, body);

                        // 인라인 스타일 보존: 생성된 노드에 원본 DOM의 인라인 스타일 적용
                        preserveInlineStyles(body, generatedNodes);

                        // root 노드에는 element 또는 decorator 노드만 삽입 가능
                        // 텍스트 노드나 다른 타입의 노드는 필터링
                        const validNodes = generatedNodes.filter(
                            node => $isElementNode(node) || $isDecoratorNode(node),
                        );

                        if (validNodes.length > 0) {
                            root.append(...validNodes);
                        } else {
                            // 유효한 노드가 없으면 빈 paragraph 추가
                            root.append($createParagraphNode());
                        }
                    }
                },
                { discrete: true },
            );
            isImportingRef.current = false;
        }, 0);

        return () => clearTimeout(tid);
    }, [editor, htmlValue, isInternalUpdateRef]); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
}

// 에디터 변경을 감지해서 HTML 문자열로 변환하는 플러그인
function HtmlExportPlugin({
    onHtmlChange,
    isInternalUpdateRef,
    isImportingRef,
}: {
    onHtmlChange: (html: string) => void;
    isInternalUpdateRef: React.MutableRefObject<boolean>;
    isImportingRef: React.MutableRefObject<boolean>;
}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerUpdateListener(() => {
            editor.getEditorState().read(() => {
                if (isImportingRef.current) {
                    return;
                }
                const html = $generateHtmlFromNodes(editor, null);
                // 내부 변경 플래그 설정 후 상위로 알림
                isInternalUpdateRef.current = true;
                onHtmlChange(html);
            });
        });
    }, [editor, onHtmlChange, isInternalUpdateRef, isImportingRef]);

    return null;
}

export function Editor({
    editorState,
    editorSerializedState,
    htmlValue,
    onChange,
    onSerializedChange,
    onHtmlChange,
    children,
    editable = true,
    className = "",
}: {
    editorState?: EditorState;
    editorSerializedState?: SerializedEditorState;
    htmlValue?: string;
    onChange?: (editorState: EditorState) => void;
    onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
    onHtmlChange?: (html: string) => void;
    children?: React.ReactNode;
    editable?: boolean;
    className?: string;
}) {
    const isInternalUpdateRef = useRef<boolean>(false);
    const isImportingRef = useRef<boolean>(false);
    return (
        <div className={`overflow-hidden${editable ? " rounded-lg border shadow" : ""} ${className}`}>
            <LexicalComposer
                initialConfig={{
                    ...editorConfig,
                    editable,
                    ...(editorState ? { editorState } : {}),
                    ...(editorSerializedState ? { editorState: JSON.stringify(editorSerializedState) } : {}),
                }}
            >
                <CollaborationContext.Provider
                    value={{
                        isCollabActive: false,
                        color: "",
                        name: "",
                        yjsDocMap: new Map(),
                    }}
                >
                    <TooltipProvider>
                        <Plugins editable={editable} />
                        {htmlValue !== undefined || onHtmlChange ? (
                            <>
                                <HtmlImportPlugin
                                    htmlValue={htmlValue || ""}
                                    isInternalUpdateRef={isInternalUpdateRef}
                                    isImportingRef={isImportingRef}
                                />
                                {onHtmlChange && (
                                    <HtmlExportPlugin
                                        onHtmlChange={onHtmlChange}
                                        isInternalUpdateRef={isInternalUpdateRef}
                                        isImportingRef={isImportingRef}
                                    />
                                )}
                            </>
                        ) : null}
                        {children}

                        <OnChangePlugin
                            ignoreSelectionChange={true}
                            onChange={editorState => {
                                onChange?.(editorState);
                                onSerializedChange?.(editorState.toJSON());
                            }}
                        />
                    </TooltipProvider>
                </CollaborationContext.Provider>
            </LexicalComposer>
        </div>
    );
}
