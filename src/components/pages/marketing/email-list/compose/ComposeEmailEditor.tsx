'use client';

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Link as TiptapLink } from "@tiptap/extension-link";
import { Image as TiptapImage } from "@tiptap/extension-image";
import {
    Bold, Italic, Eraser, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, Link, Image,
} from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ComposeEmailEditorProps {
    value: string;
    onChange: (html: string) => void;
}

const ToolbarButton = ({
    active,
    onClick,
    children,
    title,
}: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={`p-1.5 rounded transition-colors ${active ? "bg-[#0098E8] text-white" : "text-[#1B1B1B] hover:bg-[#F1F1F1]"}`}
    >
        {children}
    </button>
);

const Divider = () => <span className="w-px h-5 bg-[#DFE1E7]" />;

export function ComposeEmailEditor({ value, onChange }: ComposeEmailEditorProps) {
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline,
            TextStyle,
            Color,
            TiptapLink.configure({ openOnClick: false }),
            TiptapImage,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none focus:outline-none min-h-[250px] p-4 text-[#1B1B1B]",
            },
        },
    });

    if (!editor) return null;

    const handleAddLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl("");
            setLinkModalOpen(false);
        }
    };

    const handleAddImage = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl("");
            setImageModalOpen(false);
        }
    };

    return (
        <>
            <div className="border border-[#DFE1E7] rounded-lg overflow-hidden">
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#DFE1E7] bg-[#F8FAFB]">
                    <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
                        <Bold size={16} />
                    </ToolbarButton>
                    <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
                        <Italic size={16} />
                    </ToolbarButton>
                    <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
                        <span className="underline">U</span>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
                        <Eraser size={16} />
                    </ToolbarButton>

                    <Divider />

                    <select
                        onChange={(e) => {
                            const level = parseInt(e.target.value);
                            if (level) editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
                        }}
                        className="text-xs border border-[#DFE1E7] rounded px-1 py-1 bg-white text-[#1B1B1B] outline-none"
                        value={editor.isActive("heading") ? editor.getAttributes("heading").level : ""}
                    >
                        <option value="">Paragraph</option>
                        <option value="1">Heading 1</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                    </select>

                    <Divider />

                    <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
                        <List size={16} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
                        <ListOrdered size={16} />
                    </ToolbarButton>

                    <Divider />

                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
                        <AlignLeft size={16} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
                        <AlignCenter size={16} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
                        <AlignRight size={16} />
                    </ToolbarButton>

                    <Divider />

                    <ToolbarButton onClick={() => setLinkModalOpen(true)} active={editor.isActive("link")} title="Insert link">
                        <Link size={16} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => setImageModalOpen(true)} title="Insert image">
                        <Image size={16} />
                    </ToolbarButton>
                </div>
                <EditorContent editor={editor} />
            </div>

            {/* Link Modal */}
            <Modal isOpen={linkModalOpen} onClose={() => setLinkModalOpen(false)} title="Insert Link" size="sm">
                <div className="flex flex-col gap-4 py-2">
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">URL</label>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2.5 border border-[#DFE1E7] rounded-lg text-sm outline-none focus:border-[#0098E8] bg-white"
                            onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-2 border-t border-[#E8E8E9]">
                        <Button type="button" variant="outline" onClick={() => setLinkModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddLink}>Insert Link</Button>
                    </div>
                </div>
            </Modal>

            {/* Image Modal */}
            <Modal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} title="Insert Image" size="sm">
                <div className="flex flex-col gap-4 py-2">
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Image URL</label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.png"
                            className="w-full px-4 py-2.5 border border-[#DFE1E7] rounded-lg text-sm outline-none focus:border-[#0098E8] bg-white"
                            onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-2 border-t border-[#E8E8E9]">
                        <Button type="button" variant="outline" onClick={() => setImageModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddImage}>Insert Image</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}