'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { createStage } from '@/services/stage.service';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface CreateStageModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreated: () => void;
}

export function CreateStageModal({
	isOpen,
	onClose,
	onCreated,
}: CreateStageModalProps) {
	const [name, setName] = useState('');
	const [color, setColor] = useState('#0098E8');
	const [opacity, setOpacity] = useState(100);
	const [sortOrder, setSortOrder] = useState<number>(1);
	const [file, setFile] = useState<File | null>(null);
	const [filePreview, setFilePreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.files?.[0] || null;
		setFile(selected);
		if (selected) {
			const reader = new FileReader();
			reader.onloadend = () => setFilePreview(reader.result as string);
			reader.readAsDataURL(selected);
		} else {
			setFilePreview(null);
		}
	};

	const removeFile = () => {
		setFile(null);
		setFilePreview(null);
	};

	const hexToRgba = (hex: string, alpha: number): string => {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.warning('Please enter a stage name');
			return;
		}
		setIsSubmitting(true);
		try {
			await createStage({
				name: name.trim(),
				color: color,
				sort_order: sortOrder,
				file,
			});
			toast.success(`Stage "${name}" created`);
			setName('');
			setColor('#0098E8');
			setOpacity(100);
			setSortOrder(1);
			setFile(null);
			setFilePreview(null);
			onCreated();
			onClose();
		} catch (error: any) {
			toast.error(error?.message || 'Failed to create stage');

		} finally {
			setIsSubmitting(false);
		}
	};

	const modalTitle = (
		<div className='flex items-center gap-3'>
			<div
				className='w-10 h-10 rounded-xl flex items-center justify-center'
				style={{ backgroundColor: hexToRgba(color, opacity) }}
			>
				<svg width='18' height='18' viewBox='0 0 18 18' fill='none'>
					<path
						d='M9 2.4375V15.5625M2.4375 9H15.5625'
						stroke='#FFFFFF'
						strokeWidth='2'
						strokeLinecap='round'
					/>
				</svg>
			</div>
			<div>
				<span className='text-[#1B1B1B] font-inter text-lg font-semibold'>
					Create New Stage
				</span>
				<p className='text-[#777980] font-inter text-xs'>
					Add a custom stage to your pipeline
				</p>
			</div>
		</div>
	);

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size='md'>
			<form onSubmit={handleSubmit} className='flex flex-col gap-5'>
				{/* Name */}
				<div>
					<label
						htmlFor='stageName'
						className='block text-sm font-medium text-[#1B1B1B] mb-1.5'
					>
						Stage Name
					</label>
					<input
						id='stageName'
						type='text'
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						placeholder='e.g. Follow Up'
						className='w-full px-4 py-3 border border-[#DFE1E7] rounded-xl text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all'
					/>
				</div>

				{/* Color Picker */}
				<div>
					<label className='block text-sm font-medium text-[#1B1B1B] mb-1.5'>
						Stage Color
					</label>
					<div className='p-4 rounded-xl border border-[#DFE1E7] bg-[#F8FAFB]'>
						<HexColorPicker
							color={color}
							onChange={setColor}
							style={{ width: '100%', height: 140 }}
						/>
						<div className='flex items-center gap-3 mt-4'>
							<div
								className='w-12 h-12 rounded-xl border border-[#DFE1E7] shadow-sm shrink-0'
								style={{ backgroundColor: hexToRgba(color, opacity) }}
							/>
							<div className='flex-1 flex items-center gap-2'>
								<input
									type='text'
									value={color}
									onChange={(e) => setColor(e.target.value)}
									className='flex-1 px-3 py-2 border border-[#DFE1E7] rounded-lg text-[#1B1B1B] font-mono text-sm outline-none focus:border-[#0098E8] transition-all'
								/>
								<input
									type='number'
									min={0}
									max={100}
									value={opacity}
									onChange={(e) => setOpacity(Number(e.target.value))}
									className='w-16 px-2 py-2 border border-[#DFE1E7] rounded-lg text-[#1B1B1B] text-sm text-center outline-none focus:border-[#0098E8] transition-all'
									title='Opacity %'
								/>
								<span className='text-[#777980] text-xs'>%</span>
							</div>
						</div>
					</div>
				</div>

				{/* Sort Order */}
				<div>
					<label
						htmlFor='sortOrder'
						className='block text-sm font-medium text-[#1B1B1B] mb-1.5'
					>
						Sort Order
					</label>
					<input
						id='sortOrder'
						type='number'
						min={1}
						value={sortOrder}
						onChange={(e) => setSortOrder(Number(e.target.value))}
						className='w-full px-4 py-3 border border-[#DFE1E7] rounded-xl text-[#1B1B1B] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all'
					/>
				</div>

				{/* Icon Upload */}
				<div>
					<label className='block text-sm font-medium text-[#1B1B1B] mb-1.5'>
						Stage Icon
					</label>
					{!filePreview ? (
						<label className='flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-[#DFE1E7] bg-[#F8FAFB] cursor-pointer hover:border-[#0098E8] hover:bg-[#F0F8FF] transition-all'>
							<svg
								width='28'
								height='28'
								viewBox='0 0 24 24'
								fill='none'
								className='text-[#777980]'
							>
								<path
									d='M12 5V19M5 12H19'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
								/>
							</svg>
							<span className='text-sm text-[#777980] font-inter'>
								Upload icon image
							</span>
							<span className='text-xs text-[#A5A5AB] font-inter'>
								SVG, PNG or JPG
							</span>
							<input
								type='file'
								accept='image/*'
								onChange={handleFileChange}
								className='hidden'
							/>
						</label>
					) : (
						<div className='flex items-center gap-3 p-4 rounded-xl border border-[#DFE1E7] bg-[#F8FAFB]'>
							<div className='w-12 h-12 rounded-lg border border-[#DFE1E7] bg-white flex items-center justify-center overflow-hidden'>
								<Image
									src={filePreview}
									alt='Preview'
									width={48}
									height={48}
									className='max-w-full max-h-full object-contain'
									unoptimized
								/>
							</div>
							<span className='flex-1 text-sm text-[#1B1B1B] font-inter truncate'>
								{file?.name}
							</span>
							<Button
								type='button'
								variant='icon'
								onClick={removeFile}
								className='flex p-2 items-center rounded-lg text-[#FF4345] hover:bg-[#FFE6E6] transition-colors'
							>
								<svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
									<path
										d='M4 4L12 12M12 4L4 12'
										stroke='currentColor'
										strokeWidth='1.5'
										strokeLinecap='round'
									/>
								</svg>
							</Button>
						</div>
					)}
				</div>

				{/* Buttons */}
				<div className='flex gap-3 justify-end pt-4 border-t border-[#E8E8E9]'>
					<Button
						type='button'
						variant='outline'
						onClick={onClose}
						className='px-6 rounded-xl'
					>
						Cancel
					</Button>
					<Button
						type='submit'
						isLoading={isSubmitting}
						loadingText='Creating...'
						className='px-6 rounded-xl'
					>
						Create Stage
					</Button>
				</div>
			</form>
		</Modal>
	);
}
