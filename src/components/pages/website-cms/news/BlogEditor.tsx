'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code,
    Link2,
    Image as ImageIcon,
    Table as TableIcon,
    Eraser,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
} from 'lucide-react';
import { useState } from 'react';
import { LinkModal } from '@/components/ui/LinkModal';
import { ImageModal } from '@/components/ui/ImageModal';

interface BlogEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const ToolbarButton = ({
    active,
    onClick,
    children,
}: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-2 rounded-lg transition-colors ${active ? 'bg-[#0098E8] text-white' : 'text-[#1B1B1B] hover:bg-[#F1F1F1]'
            }`}
    >
        {children}
    </button>
);

export function BlogEditor({ value, onChange, placeholder = 'Write your post content here…' }: BlogEditorProps) {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            UnderlineExtension,
            Link.configure({
                openOnClick: false,
            }),
            Image,
            Placeholder.configure({
                placeholder: placeholder,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class:
                    'prose prose-sm max-w-none focus:outline-none min-h-[288px] p-4 text-[#1B1B1B] [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[#DFE1E7] [&_blockquote]:pl-4 [&_blockquote]:text-[#777980] [&_code]:bg-[#F1F1F1] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded',
            },
        },
    });

    if (!editor) return null;

    const handleLinkClick = () => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);
        const isLinkActive = editor.isActive('link');

        // If there's selected text or a link is active, open modal
        if (selectedText || isLinkActive) {
            setIsLinkModalOpen(true);
        } else {
            // If no text is selected, insert a placeholder link
            // Or just open the modal
            setIsLinkModalOpen(true);
        }
    };

    const handleImageClick = () => {
        setIsImageModalOpen(true);
    };

    const handleLinkSave = (url: string) => {
        const { from, to } = editor.state.selection;
        const hasSelection = from !== to;

        if (hasSelection) {
            // Link existing selection
            editor.chain().focus().setLink({ href: url }).run();
        } else {
            // Insert new link with placeholder text
            const linkText = 'Link text';
            editor
                .chain()
                .focus()
                .insertContent({
                    type: 'text',
                    marks: [{ type: 'link', attrs: { href: url } }],
                    text: linkText,
                })
                .run();
        }
    };

    const handleImageSave = (url: string) => {
        editor.chain().focus().setImage({ src: url }).run();
    };

    return (
        <>
            <div className="rounded-lg border border-[#DFE1E7] bg-white overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-3 border-b border-[#DFE1E7] bg-[#F8FAFB]">
                    {/* Text Formatting */}
                    <ToolbarButton
                        active={editor.isActive('bold')}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <Bold size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('italic')}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <Italic size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('underline')}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                        <Underline size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('strike')}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    >
                        <Strikethrough size={18} />
                    </ToolbarButton>

                    <span className="w-px h-6 bg-[#DFE1E7] mx-1" />

                    {/* Headings */}
                    <ToolbarButton
                        active={editor.isActive('heading', { level: 1 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                        <Heading1 size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('heading', { level: 2 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        <Heading2 size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('heading', { level: 3 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    >
                        <Heading3 size={18} />
                    </ToolbarButton>

                    <span className="w-px h-6 bg-[#DFE1E7] mx-1" />

                    {/* Lists & Blocks */}
                    <ToolbarButton
                        active={editor.isActive('bulletList')}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <List size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('orderedList')}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('blockquote')}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <Quote size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('code')}
                        onClick={() => editor.chain().focus().toggleCode().run()}
                    >
                        <Code size={18} />
                    </ToolbarButton>

                    <span className="w-px h-6 bg-[#DFE1E7] mx-1" />

                    {/* Links & Media - UPDATED with custom modals */}
                    <ToolbarButton
                        active={editor.isActive('link')}
                        onClick={handleLinkClick}
                    >
                        <Link2 size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={handleImageClick}>
                        <ImageIcon size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
                        }}
                    >
                        <TableIcon size={18} />
                    </ToolbarButton>

                    <span className="w-px h-6 bg-[#DFE1E7] mx-1" />

                    {/* Text Align */}
                    <ToolbarButton
                        active={editor.isActive({ textAlign: 'left' })}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    >
                        <AlignLeft size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive({ textAlign: 'center' })}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    >
                        <AlignCenter size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive({ textAlign: 'right' })}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    >
                        <AlignRight size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive({ textAlign: 'justify' })}
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    >
                        <AlignJustify size={18} />
                    </ToolbarButton>

                    <span className="w-px h-6 bg-[#DFE1E7] mx-1" />

                    {/* Actions */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    >
                        <Eraser size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
                        <Undo size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
                        <Redo size={18} />
                    </ToolbarButton>
                </div>

                {/* Editor Content */}
                <EditorContent editor={editor} />
            </div>

            {/* Custom Modals */}
            <LinkModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                onSave={handleLinkSave}
            />

            <ImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onSave={handleImageSave}
            />
        </>
    );
}