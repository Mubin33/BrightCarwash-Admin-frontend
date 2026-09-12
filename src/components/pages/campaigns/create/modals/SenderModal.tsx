"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";

interface SenderModalProps {
	isOpen: boolean;
	onClose: () => void;
	campaignName: string;
	initialName?: string;
	initialEmail?: string;
	onSave?: (name: string, email: string) => void;
}

const labelClass =
	"text-[#777980] font-inter text-base font-normal leading-[130%]";
const inputClass =
	"px-4 py-3 border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all shadow-none";

export function SenderModal({
	isOpen,
	onClose,
	campaignName,
	initialName = "Foysal Hasan",
	initialEmail = "foysalhasan.bdcalling@gmail.com",
	onSave,
}: SenderModalProps) {
	const [senderName, setSenderName] = useState(initialName);
	const [senderEmail, setSenderEmail] = useState(initialEmail);
	const [starred, setStarred] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setSenderName(initialName);
			setSenderEmail(initialEmail);
		}
	}, [isOpen, initialName, initialEmail]);

	const avatarBg = "#A0887E";
	const firstLetter = senderName.trim().charAt(0).toUpperCase() || "F";
	const today = new Date().toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});

	const modalTitle = (
		<div className="flex flex-col gap-1">
			<span className="text-[#1D1F2C] font-inter text-2xl font-medium leading-[100%]">
				Sender
			</span>
			<span className="text-[#777980] font-inter text-sm font-normal leading-[132%]">
				Who is sending this email campaign?
			</span>
		</div>
	);

	const handleSave = () => {
		if (onSave) {
			onSave(senderName, senderEmail);
		}
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={modalTitle}
			size="md"
			bodyClassName="py-3!"
		>
			<div className="flex flex-col gap-4">
				<div className="w-full h-px bg-[#DFE1E7]" />

				<FormInput
					id="senderName"
					label="Name"
					type="text"
					value={senderName}
					onChange={(e) => setSenderName(e.target.value)}
					labelClassName={labelClass}
					className={inputClass}
				/>
				<FormInput
					id="senderEmail"
					label="E-mail Address"
					type="email"
					value={senderEmail}
					onChange={(e) => setSenderEmail(e.target.value)}
					labelClassName={labelClass}
					className={inputClass}
					disabled
				/>
				<p className="text-xs text-[#777980] -mt-2">
					Sender email is fixed to ensure deliverability
				</p>

				<div>
					<label className={labelClass}>Preview</label>
					<div className="flex h-20 p-3 justify-between items-center self-stretch rounded-xl border border-[#DFE1E7] bg-white mt-1.5">
						<div className="flex items-start gap-4">
							<div
								className="flex w-10 h-10 flex-col justify-center items-center rounded-full text-white font-inter text-sm font-semibold"
								style={{ backgroundColor: avatarBg }}
							>
								{firstLetter}
							</div>
							<div className="flex flex-col justify-between items-start self-stretch">
								<span className="text-[#1D1F2C] font-inter text-base font-bold leading-[100%]">
									{senderName || "Foysal Hasan"}
								</span>
								<span className="text-[#4A4C56] font-inter text-sm font-medium leading-[100%]">
									{campaignName}
								</span>
							</div>
						</div>
						<div className="flex flex-col justify-between items-end self-stretch">
							<span className="text-[#777980] font-inter text-xs">{today}</span>
							<Button
								variant="icon"
								onClick={() => setStarred(!starred)}
								className="p-0"
							>
								<Star
									size={20}
									className={
										starred ? "text-[#FFAF00] fill-[#FFAF00]" : "text-[#777980]"
									}
								/>
							</Button>
						</div>
					</div>
				</div>

				<div className="flex gap-3 justify-end pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="px-6 w-auto!"
					>
						Cancel
					</Button>
					<Button onClick={handleSave} className="px-6 w-auto!">
						Save
					</Button>
				</div>
			</div>
		</Modal>
	);
}