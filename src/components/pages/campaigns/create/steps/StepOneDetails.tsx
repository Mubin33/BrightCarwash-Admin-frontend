"use client";

import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StepOneDetailsProps {
	campaignName: string;
	setCampaignName: (v: string) => void;
	tagInput: string;
	setTagInput: (v: string) => void;
	tags: string[];
	addTag: () => void;
	removeTag: (t: string) => void;
	handleTagKeyDown: (e: React.KeyboardEvent) => void;
	onContinue: () => void;
}

const labelClass =
	'block text-[#777980] font-inter text-base font-normal leading-[130%] mb-1.5';
const inputClass =
	'w-full px-4 py-3 border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all';

export function StepOneDetails({
	campaignName,
	setCampaignName,
	tagInput,
	setTagInput,
	tags,
	addTag,
	removeTag,
	handleTagKeyDown,
	onContinue,
}: StepOneDetailsProps) {
	return (
		<div className='flex flex-col justify-end items-start gap-6 self-stretch'>
			<h2 className='text-[#1D1F2C] font-inter text-2xl font-bold leading-[132%] tracking-[0.12px]'>
				Create Campaign
			</h2>

			<div className='flex p-4 flex-col justify-end items-end gap-6 self-stretch rounded-lg border border-[#DFE1E7] bg-[#F8FAFB]'>
				<div className='flex flex-col md:flex-row items-start gap-4 self-stretch'>
					<div className='flex-1 w-full'>
						<label htmlFor='campaignName' className={labelClass}>
							Campaign Name
						</label>
						<input
							id='campaignName'
							type='text'
							value={campaignName}
							onChange={(e) => setCampaignName(e.target.value)}
							placeholder='Enter campaign name'
							className={inputClass}
						/>
					</div>
					<div className='flex-1 w-full'>
						<label htmlFor='tagInput' className={labelClass}>
							Campaign Tags
						</label>
						<div className='flex flex-wrap items-center gap-2 p-3 border border-[#DFE1E7] rounded-lg bg-white min-h-11.5'>
							{tags.map((tag) => (
								<span
									key={tag}
									className='inline-flex py-1.5 px-3 justify-center items-center gap-2 rounded bg-[#ECEFF3] text-[#777980] font-inter text-sm font-normal leading-[112%]'
								>
									{tag}
									<Button
										variant='icon'
										type='button'
										onClick={() => removeTag(tag)}
										className='text-[#777980] hover:text-[#FF4345] transition-colors p-0'
									>
										<X size={12} />
									</Button>
								</span>
							))}
							<input
								id='tagInput'
								type='text'
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={handleTagKeyDown}
								placeholder={
									tags.length === 0 ? 'Type and press Enter to add tags' : ''
								}
								className='flex-1 min-w-20 border-none outline-none text-sm text-[#1B1B1B] placeholder-[#777980] font-inter bg-transparent py-0'
							/>
							{/* ✅ Mobile-friendly: Show "Add" button on small screens */}
							{tagInput.trim() && (
								<Button
									type="button"
									variant="outline"
									onClick={addTag}
									className="py-1 px-3 text-xs md:hidden w-auto!"
								>
									Add
								</Button>
							)}
						</div>
						<p className="text-xs text-[#777980] mt-1 hidden md:block">
							Press <kbd className="px-1 py-0.5 bg-[#F1F1F1] rounded text-[#777980] text-xs">Enter</kbd> to add tag
						</p>
					</div>
				</div>
				<Button
					onClick={onContinue}
					disabled={!campaignName.trim()}
					className='flex py-2.5 px-4 justify-center items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors w-auto disabled:opacity-50 disabled:cursor-not-allowed'
				>
					Continue
				</Button>
			</div>
		</div>
	);
}