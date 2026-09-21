'use client';

import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { ChevronDown } from 'lucide-react';

interface TimeOption {
	value: string;
	label: string;
	disabled: boolean;
}

interface TimePickerProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

function formatTime(
	hour: number,
	minute: number,
): string {
	const period = hour >= 12 ? 'PM' : 'AM';

	const displayHour = hour % 12 || 12;

	return `${displayHour}:${String(minute).padStart(
		2,
		'0',
	)} ${period}`;
}


function getTimeValue(
	hour: number,
	minute: number,
): string {
	return `${String(hour).padStart(
		2,
		'0',
	)}:${String(minute).padStart(2, '0')}`;
}

export function TimePicker({
	value,
	onChange,
	disabled = false,
}: TimePickerProps) {
	const [open, setOpen] = useState(false);

	const containerRef =
		useRef<HTMLDivElement>(null);

	const optionRefs =
		useRef<
			Record<
				string,
				HTMLButtonElement | null
			>
		>({});


	const [now, setNow] = useState(
		new Date(),
	);

	useEffect(() => {
		const interval = window.setInterval(() => {
			setNow(new Date());
		}, 1000);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		const handleClickOutside = (
			event: MouseEvent,
		) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(
					event.target as Node,
				)
			) {
				setOpen(false);
			}
		};

		document.addEventListener(
			'mousedown',
			handleClickOutside,
		);

		return () => {
			document.removeEventListener(
				'mousedown',
				handleClickOutside,
			);
		};
	}, []);


	const minimumAllowedTime = useMemo(() => {
		const minimum = new Date(now);


		minimum.setSeconds(0, 0);

		minimum.setMinutes(
			minimum.getMinutes() + 5,
		);

		return minimum;
	}, [now]);


	const timeOptions = useMemo<
		TimeOption[]
	>(() => {
		const options: TimeOption[] = [];

		for (
			let hour = 0;
			hour < 24;
			hour++
		) {
			for (
				let minute = 0;
				minute < 60;
				minute++
			) {
				const optionDate =
					new Date(now);

				optionDate.setHours(
					hour,
					minute,
					0,
					0,
				);

				//Disable current time and the next 5 minutes.
			
				const isDisabled =
					optionDate <
					minimumAllowedTime;

				options.push({
					value: getTimeValue(
						hour,
						minute,
					),

					label: formatTime(
						hour,
						minute,
					),

					disabled: isDisabled,
				});
			}
		}

		return options;
	}, [
		now,
		minimumAllowedTime,
	]);

	const firstAvailableTime = useMemo(() => {
		return timeOptions.find(
			(option) =>
				!option.disabled,
		);
	}, [timeOptions]);


	useEffect(() => {
		if (!firstAvailableTime) {
			return;
		}

		const currentOption =
			timeOptions.find(
				(option) =>
					option.value === value,
			);

		const shouldSelectFirstAvailable =
			!value ||
			currentOption?.disabled === true;

		if (
			shouldSelectFirstAvailable &&
			value !== firstAvailableTime.value
		) {
			onChange(
				firstAvailableTime.value,
			);
		}
	}, [
		firstAvailableTime,
		timeOptions,
		value,
		onChange,
	]);


	const selectedOption =
		timeOptions.find(
			(option) =>
				option.value === value,
		);

	useEffect(() => {
		if (!open || !value) {
			return;
		}

		const timer = window.setTimeout(() => {
			const selected =
				optionRefs.current[value];

			if (selected) {
				selected.scrollIntoView({
					block: 'center',
					behavior: 'instant',
				});
			}
		}, 50);

		return () => {
			window.clearTimeout(timer);
		};
	}, [open, value]);

	return (
		<div
			ref={containerRef}
			className="relative w-full"
		>


			<button
				type="button"
				disabled={disabled}
				onClick={() => {
					if (disabled) {
						return;
					}

					setOpen(
						(previous) =>
							!previous,
					);
				}}
				className={`w-full h-11.5 rounded-lg border border-[#E8E8E9] bg-white px-4 flex items-center justify-between font-inter text-sm transition-colors ${
					disabled
						? 'cursor-not-allowed opacity-60'
						: 'cursor-pointer hover:bg-[#F8FAFB]'
				}`}
			>
				<span
					className={
						selectedOption
							? 'text-[#1B1B1B]'
							: 'text-[#777980]'
					}
				>
					{selectedOption?.label ||
						'Pick time'}
				</span>

				<ChevronDown
					size={16}
					className={`text-[#777980] transition-transform duration-200 ${
						open
							? 'rotate-180'
							: ''
					}`}
				/>
			</button>

			{open && (
				<div className="absolute left-0 right-0 top-12.5 z-9999 rounded-lg border border-[#BFC0C4] bg-white shadow-lg overflow-hidden">
					<div
						className="overflow-y-auto"
						style={{
							height: '210px',
						}}
					>
						{timeOptions.map(
							(option) => {
								const isSelected =
									option.value ===
									value;

								return (
									<button
										key={
											option.value
										}
										ref={(element) => {
											optionRefs.current[
												option.value
											] =
												element;
										}}
										type="button"
										disabled={
											option.disabled
										}
										onClick={() => {
											
											if (
												option.disabled
											) {
												return;
											}

										
											onChange(
												option.value,
											);

										
											setOpen(
												false,
											);
										}}
										className={`w-full h-10 px-4 flex items-center justify-center text-sm font-inter transition-colors ${
											option.disabled
												? 'bg-white text-[#D0D0D0] cursor-not-allowed'
												: isSelected
													? 'bg-[#5B91ED] text-white font-semibold'
													: 'bg-white text-[#1B1B1B] hover:bg-[#F5F7FA] cursor-pointer'
										}`}
									>
										{
											option.label
										}
									</button>
								);
							},
						)}
					</div>
				</div>
			)}
		</div>
	);
}