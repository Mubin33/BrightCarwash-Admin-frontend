"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

import { Color } from "@tiptap/extension-color";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { Link as TiptapLink } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
} from "lucide-react";


interface ComposeEmailEditorProps {
  value: string;
  onChange: (html: string) => void;
}

interface ToolbarButtonProps {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}

const ToolbarButton = ({
  active,
  onClick,
  children,
  title,
}: ToolbarButtonProps) => {
  return (
    <button
      type="button"
      /*
       * IMPORTANT:
       * Prevent the editor selection from disappearing
       * when clicking the toolbar.
       */
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active ? "bg-[#0098E8] text-white" : "text-[#1B1B1B] hover:bg-[#F1F1F1]"
      }`}
    >
      {children}
    </button>
  );
};

const Divider = () => <span className="w-px h-5 bg-[#DFE1E7] mx-1" />;

export function ComposeEmailEditor({
  value,
  onChange,
}: ComposeEmailEditorProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),

      Underline,

      TextStyle,

      Color,

      /*
       * REQUIRED FOR TEXT ALIGNMENT
       */
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      TiptapLink.configure({
        openOnClick: false,
      }),

      TiptapImage,
    ],

    content: value,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[250px] p-4 text-[#1B1B1B]",
      },
    },

    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  /*
   * =========================
   * LINK
   * =========================
   */

  const handleAddLink = () => {
    if (!linkUrl.trim()) {
      return;
    }

    editor
      .chain()
      .focus()
      .setLink({
        href: linkUrl.trim(),
      })
      .run();

    setLinkUrl("");
    setLinkModalOpen(false);
  };

  /*
   * =========================
   * IMAGE
   * =========================
   */

  const handleAddImage = () => {
    if (!imageUrl.trim()) {
      return;
    }

    editor
      .chain()
      .focus()
      .setImage({
        src: imageUrl.trim(),
      })
      .run();

    setImageUrl("");
    setImageModalOpen(false);
  };

  /*
   * =========================
   * CLEAR FORMAT
   * =========================
   */

  const handleClearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  /*
   * =========================
   * HEADING
   * =========================
   */

  const handleHeadingChange = (value: string) => {
    if (value === "") {
      editor.chain().focus().setParagraph().run();

      return;
    }

    const level = Number(value) as 1 | 2 | 3;

    editor
      .chain()
      .focus()
      .toggleHeading({
        level,
      })
      .run();
  };

  return (
    <>
      <div className="border border-[#DFE1E7] rounded-lg overflow-hidden">
        {/* ========================================
            TOOLBAR
        ======================================== */}

        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#DFE1E7] bg-[#F8FAFB]">
          {/* ======================
              BOLD
          ====================== */}

          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold size={16} />
          </ToolbarButton>

          {/* ======================
              ITALIC
          ====================== */}

          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic size={16} />
          </ToolbarButton>

          {/* ======================
              UNDERLINE
          ====================== */}

          <ToolbarButton
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <span className="underline font-medium">U</span>
          </ToolbarButton>

          {/* ======================
              CLEAR FORMAT
          ====================== */}

          <ToolbarButton
            onClick={handleClearFormatting}
            title="Clear formatting"
          >
            <Eraser size={16} />
          </ToolbarButton>

          <Divider />

          {/* ======================
              HEADING
          ====================== */}

          <select
            value={
              editor.isActive("heading")
                ? String(editor.getAttributes("heading").level)
                : ""
            }
            onChange={(e) => handleHeadingChange(e.target.value)}
            className="text-xs border border-[#DFE1E7] rounded px-2 py-1.5 bg-white text-[#1B1B1B] outline-none focus:border-[#0098E8]"
          >
            <option value="">Paragraph</option>

            <option value="1">Heading 1</option>

            <option value="2">Heading 2</option>

            <option value="3">Heading 3</option>
          </select>

          <Divider />

          {/* ======================
              BULLET LIST
          ====================== */}

          <ToolbarButton
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            <List size={16} />
          </ToolbarButton>

          {/* ======================
              ORDERED LIST
          ====================== */}

          <ToolbarButton
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            <ListOrdered size={16} />
          </ToolbarButton>

          <Divider />

          {/* ========================================
              ALIGNMENT
          ======================================== */}

          {/* ALIGN LEFT */}

          <ToolbarButton
            active={editor.isActive({
              textAlign: "left",
            })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align left"
          >
            <AlignLeft size={16} />
          </ToolbarButton>

          {/* ALIGN CENTER */}

          <ToolbarButton
            active={editor.isActive({
              textAlign: "center",
            })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align center"
          >
            <AlignCenter size={16} />
          </ToolbarButton>

          {/* ALIGN RIGHT */}

          <ToolbarButton
            active={editor.isActive({
              textAlign: "right",
            })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align right"
          >
            <AlignRight size={16} />
          </ToolbarButton>

          <Divider />

          {/* ======================
              LINK
          ====================== */}

          <ToolbarButton
            active={editor.isActive("link")}
            onClick={() => setLinkModalOpen(true)}
            title="Insert link"
          >
            <Link size={16} />
          </ToolbarButton>

          {/* ======================
              IMAGE
          ====================== */}

          <ToolbarButton
            onClick={() => setImageModalOpen(true)}
            title="Insert image"
          >
            <Image size={16} />
          </ToolbarButton>
        </div>

        {/* ========================================
            EDITOR
        ======================================== */}

        <EditorContent editor={editor} />
      </div>

      {/* ========================================
          LINK MODAL
      ======================================== */}

      <Modal
        isOpen={linkModalOpen}
        onClose={() => {
          setLinkModalOpen(false);
          setLinkUrl("");
        }}
        title="Insert Link"
        size="sm"
      >
        <div className="flex flex-col gap-4 py-2">
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
              URL
            </label>

            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 border border-[#DFE1E7] rounded-lg text-sm outline-none focus:border-[#0098E8] bg-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-[#E8E8E9]">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLinkModalOpen(false);
                setLinkUrl("");
              }}
            >
              Cancel
            </Button>

            <Button type="button" onClick={handleAddLink}>
              Insert Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================
          IMAGE MODAL
      ======================================== */}

      <Modal
        isOpen={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          setImageUrl("");
        }}
        title="Insert Image"
        size="sm"
      >
        <div className="flex flex-col gap-4 py-2">
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
              Image URL
            </label>

            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full px-4 py-2.5 border border-[#DFE1E7] rounded-lg text-sm outline-none focus:border-[#0098E8] bg-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-[#E8E8E9]">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setImageModalOpen(false);
                setImageUrl("");
              }}
            >
              Cancel
            </Button>

            <Button type="button" onClick={handleAddImage}>
              Insert Image
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
