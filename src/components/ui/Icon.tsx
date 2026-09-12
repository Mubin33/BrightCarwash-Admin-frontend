'use client';

import Image from 'next/image';

interface IconProps {
	name: string;
	width?: number;
	height?: number;
	className?: string;
	color?: string;
	opacity?: number;
}

export function Icon({
	name,
	width = 20,
	height = 20,
	className = '',
	color,
	opacity,
}: IconProps) {
	if (color) {
		return (
			<span
				className={`inline-block shrink-0 ${className}`}
				style={{
					width,
					height,
					opacity,
					backgroundColor: color,
					WebkitMask: `url(/icons/svgs/${name}.svg) no-repeat center / contain`,
					mask: `url(/icons/svgs/${name}.svg) no-repeat center / contain`,
				}}
			/>
		);
	}

	return (
		<Image
			src={`/icons/svgs/${name}.svg`}
			alt={`${name} icon`}
			width={width}
			height={height}
			className={`shrink-0 ${className}`}
			style={{ opacity }}
			unoptimized
		/>
	);
}