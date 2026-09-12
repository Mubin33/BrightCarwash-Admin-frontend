'use client';

interface Step {
	id: number;
	title?: string;
}

interface StepperProps {
	steps: Step[];
	currentStep: number;
	onStepClick?: (step: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
	return (
		<div className='flex items-center justify-end w-full'>
			<div className='flex items-center w-full max-w-xs'>
				{steps.map((step, index) => (
					<div
						key={step.id}
						className='flex items-center flex-1 last:flex-none'
					>
						<div className='flex flex-col items-center relative z-10'>
							<button
								onClick={() => onStepClick?.(step.id)}
								className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-200 border-2 ${
									step.id === currentStep
										? 'bg-[#B23730] text-white border-[#B23730] shadow-md scale-110'
										: step.id < currentStep
											? 'bg-[#006F1F] text-white border-[#006F1F]'
											: 'bg-white text-[#777980] border-[#DFE1E7] hover:border-[#B0B3BC]'
								}`}
							>
								{step.id < currentStep ? '✓' : step.id}
							</button>
							{/* {step.title && (
								<p
									className={`mt-1 text-[10px] font-medium text-center transition-colors whitespace-nowrap ${
										step.id === currentStep
											? 'text-[#B23730]'
											: 'text-[#777980]'
									}`}
								>
									{step.title}
								</p>
							)} */}
						</div>
						{index < steps.length - 1 && (
							<div className='flex-1 h-0.5 mx-1 relative '>
								<div
									className={`h-full w-full rounded transition-all duration-300 ${
										step.id < currentStep ? 'bg-[#006F1F]' : 'bg-[#DFE1E7]'
									}`}
								/>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
