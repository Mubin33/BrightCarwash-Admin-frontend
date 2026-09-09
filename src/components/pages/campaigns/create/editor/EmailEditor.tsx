'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { EditorRef } from 'react-email-editor';
import { toast } from 'react-toastify';
import {
	useCreateTemplateMutation,
	useUpdateTemplateMutation,
	useGetTemplateByIdQuery,
	useUploadTemplateImageMutation,
} from '@/services/template.api';
import { uploadImagesInHtml } from '@/lib/image-upload';

const EmailEditorComponent = dynamic(() => import('react-email-editor'), {
	ssr: false,
	loading: () => <div className='h-150 bg-gray-100 animate-pulse rounded-lg' />,
});

export function EmailEditor() {
	const emailEditorRef = useRef<EditorRef>(null);
	const [saving, setSaving] = useState(false);
	const [templateName, setTemplateName] = useState('');
	const [editorReady, setEditorReady] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const templateId = searchParams.get('templateId');
	const isEditing = !!templateId;

	const [createTemplate] = useCreateTemplateMutation();
	const [updateTemplate] = useUpdateTemplateMutation();
	const [uploadImage] = useUploadTemplateImageMutation();
	const { data: existingTemplate } = useGetTemplateByIdQuery(templateId || '', { skip: !templateId });

	useEffect(() => {
		if (existingTemplate) {
			setTemplateName(existingTemplate.name || '');
		}
	}, [existingTemplate]);

	useEffect(() => {
		if (editorReady && existingTemplate?.emailBody?.designJson) {
			const designData = existingTemplate.emailBody.designJson;
			const design = designData.design || designData;
			emailEditorRef.current?.editor?.loadDesign(design);
		}
	}, [editorReady, existingTemplate]);

	const onEditorLoad = () => {
		const mergeTags = {
			first_name: {
				name: 'First Name',
				value: '{% if contact.FIRSTNAME %}{{ contact.FIRSTNAME }}{% else %}{{ params.FIRSTNAME }}{% endif %}',
			},
			last_name: {
				name: 'Last Name',
				value: '{% if contact.LASTNAME %}{{ contact.LASTNAME }}{% else %}{{ params.LASTNAME }}{% endif %}',
			},
		};

		if (emailEditorRef.current?.editor) {
			emailEditorRef.current.editor.setMergeTags(mergeTags);
			setEditorReady(true);
		}
	};

	const handleSave = () => {
		const name = templateName.trim() || `Template ${new Date().toLocaleDateString()}`;
		if (emailEditorRef.current?.editor) {
			setSaving(true);
			emailEditorRef.current.editor.exportHtml(async (data) => {
				try {
					const htmlContent = data.html || '<p>Empty template</p>';

					const processedHtml = await uploadImagesInHtml(htmlContent, async (file) => {
						const result = await uploadImage(file).unwrap();
						return result;
					});

					const emailBody = {
						subject: name,
						htmlContent: processedHtml,
						designJson: data.design || {},
					};

					if (isEditing && templateId) {
						await updateTemplate({
							id: templateId,
							data: {
								name,
								emailBody,
							},
						}).unwrap();
						toast.success('Template updated!');
					} else {
						await createTemplate({
							name,
							description: `Created on ${new Date().toLocaleDateString()}`,
							type: 'EMAIL',
							editorType: 'VISUAL_DRAG_DROP',
							emailBody,
						}).unwrap();
						toast.success(`Template "${name}" saved!`);
					}

					router.push('/campaigns/create?step=3');
				} catch (error) {
					toast.error(isEditing ? 'Failed to update template' : 'Failed to save template');
					console.error(error);
				} finally {
					setSaving(false);
				}
			});
		}
	};

	return (
		<div className='flex flex-col gap-4 self-stretch'>
			<div className='flex justify-between items-center self-stretch'>
				<div className='flex items-center gap-3'>
					<Link
						href={`/campaigns/create?step=3`}
						className='flex items-center text-[#777980] hover:text-[#1B1B1B] transition-colors'
					>
						<ChevronLeft size={20} />
					</Link>
					<span className='text-[#1B1B1B] font-inter text-lg font-semibold'>
						{isEditing ? 'Edit Template' : 'Email Editor'}
					</span>
				</div>
				<div className='flex items-center gap-3'>
					<input
						type='text'
						value={templateName}
						onChange={(e) => setTemplateName(e.target.value)}
						placeholder='Template name'
						className='px-3 py-2 border border-[#DFE1E7] rounded-lg text-sm font-inter outline-none focus:border-[#0098E8]'
					/>
					<Button
						onClick={handleSave}
						isLoading={saving}
						loadingText='Saving...'
						className='w-auto! px-6'
					>
						{isEditing ? 'Update Template' : 'Save Template'}
					</Button>
				</div>
			</div>
			<div className='rounded-xl border border-[#DFE1E7] overflow-hidden'>
				<EmailEditorComponent
					ref={emailEditorRef}
					minHeight='80vh'
					onLoad={onEditorLoad}
				/>
			</div>
		</div>
	);
}