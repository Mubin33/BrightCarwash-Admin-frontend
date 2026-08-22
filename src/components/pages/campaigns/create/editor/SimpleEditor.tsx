"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	ChevronLeft, Bold, Italic, Underline, Heading1, Heading2, Heading3,
	List, ListOrdered, Quote, Code, Strikethrough,
} from "lucide-react";
import { Button as UIButton } from "@/components/ui/Button";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "react-toastify";
import {
	useCreateTemplateMutation,
	useUpdateTemplateMutation,
	useGetTemplateByIdQuery,
	useUploadTemplateImageMutation,
} from "@/services/template.api";
import { uploadImagesInHtml } from "@/lib/image-upload";

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
		className={`p-2 rounded-lg transition-colors ${active ? "bg-[#0098E8] text-white" : "text-[#1B1B1B] hover:bg-[#F1F1F1]"}`}
	>
		{children}
	</button>
);

export function SimpleEditor() {
	const [saving, setSaving] = useState(false);
	const [templateName, setTemplateName] = useState('');
	const router = useRouter();
	const searchParams = useSearchParams();
	const templateId = searchParams.get('templateId');
	const isEditing = !!templateId;

	const [createTemplate] = useCreateTemplateMutation();
	const [updateTemplate] = useUpdateTemplateMutation();
	const [uploadImage] = useUploadTemplateImageMutation();
	const { data: existingTemplate } = useGetTemplateByIdQuery(templateId || '', { skip: !templateId });

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
		],
		content: existingTemplate?.emailBody?.htmlContent || "<p>Start writing your email content here...</p>",
		editorProps: {
			attributes: {
				class: "prose prose-sm max-w-none focus:outline-none min-h-[60vh] p-4 text-[#1B1B1B] [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
			},
		},
	});

	useEffect(() => {
		if (existingTemplate) {
			setTemplateName(existingTemplate.name || '');
			if (editor && existingTemplate.emailBody?.htmlContent) {
				editor.commands.setContent(existingTemplate.emailBody.htmlContent);
			}
		}
	}, [existingTemplate, editor]);

	const handleSave = async () => {
		if (!editor) return;

		setSaving(true);
		const html = editor.getHTML();
		const name = templateName.trim() || `Simple Template ${new Date().toLocaleDateString()}`;

		try {
			const processedHtml = await uploadImagesInHtml(html, async (file) => {
				const result = await uploadImage(file).unwrap();
				return result;
			});

			const emailBody = {
				subject: name,
				htmlContent: processedHtml,
				designJson: {},
			};

			if (isEditing && templateId) {
				await updateTemplate({
					id: templateId,
					data: { name, emailBody },
				}).unwrap();
				toast.success("Template updated!");
			} else {
				await createTemplate({
					name,
					description: `Created on ${new Date().toLocaleDateString()}`,
					type: "EMAIL",
					editorType: "PLAIN_TEXT",
					emailBody,
				}).unwrap();
				toast.success("Template saved! Design step complete.");
			}

			router.push("/campaigns/create?step=3");
		} catch (error) {
			toast.error(isEditing ? "Failed to update template" : "Failed to save template");
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	if (!editor) return null;

	return (
		<div className="flex flex-col gap-4 self-stretch">
			<div className="flex justify-between items-center self-stretch">
				<div className="flex items-center gap-3">
					<Link href={`/campaigns/create?step=3`} className="flex items-center text-[#777980] hover:text-[#1B1B1B] transition-colors">
						<ChevronLeft size={20} />
					</Link>
					<span className="text-[#1B1B1B] font-inter text-lg font-semibold">
						{isEditing ? 'Edit Template' : 'Easy Peasy Editor'}
					</span>
				</div>
				<div className="flex items-center gap-3">
					<input
						type="text"
						value={templateName}
						onChange={(e) => setTemplateName(e.target.value)}
						placeholder="Template name"
						className="px-3 py-2 border border-[#DFE1E7] rounded-lg text-sm font-inter outline-none focus:border-[#0098E8]"
					/>
					<UIButton onClick={handleSave} isLoading={saving} loadingText="Saving..." className="w-auto! px-6">
						{isEditing ? 'Update Template' : 'Save and create'}
					</UIButton>
				</div>
			</div>
			<div className="rounded-xl border border-[#DFE1E7] overflow-hidden bg-white">
				<div className="flex flex-wrap items-center gap-1 p-3 border-b border-[#DFE1E7] bg-[#F8FAFB]">
					<ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
						<Bold size={18} />
					</ToolbarButton>
					<ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
						<Italic size={18} />
					</ToolbarButton>
					<ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
						<Underline size={18} />
					</ToolbarButton>
					<ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
						<Strikethrough size={18} />
					</ToolbarButton>
					<span className="w-px h-6 bg-[#DFE1E7] mx-1" />
					<ToolbarButton active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
						<Heading1 size={18} />
					</ToolbarButton>
					<ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
						<Heading2 size={18} />
					</ToolbarButton>
					<ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
						<Heading3 size={18} />
					</ToolbarButton>
					<span className="w-px h-6 bg-[#DFE1E7] mx-1" />
					<ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
						<List size={18} />
					</ToolbarButton>
					<ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
						<ListOrdered size={18} />
					</ToolbarButton>
					<ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
						<Quote size={18} />
					</ToolbarButton>
					<ToolbarButton active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
						<Code size={18} />
					</ToolbarButton>
				</div>
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}