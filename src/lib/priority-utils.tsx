export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface PriorityConfig {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

const PRIORITY_CONFIG: Record<PriorityLevel, PriorityConfig> = {
    LOW: {
        label: 'Low',
        color: '#777980',
        bgColor: '#F1F1F1',
        borderColor: '#DFE1E7',
    },
    MEDIUM: {
        label: 'Medium',
        color: '#FFAF00',
        bgColor: '#FFF7E6',
        borderColor: '#FFAF00',
    },
    HIGH: {
        label: 'High',
        color: '#FF6B00',
        bgColor: '#FFF0E6',
        borderColor: '#FF6B00',
    },
    URGENT: {
        label: 'Urgent',
        color: '#FF4345',
        bgColor: '#FFE6E6',
        borderColor: '#FF4345',
    },
};

export function getPriorityConfig(priority: string): PriorityConfig {
    const key = priority?.toUpperCase() as PriorityLevel;
    return PRIORITY_CONFIG[key] || PRIORITY_CONFIG.LOW;
}

export function getPriorityLabel(priority: string): string {
    return getPriorityConfig(priority).label;
}

export function getPriorityColor(priority: string): string {
    return getPriorityConfig(priority).color;
}

export function getPriorityBgColor(priority: string): string {
    return getPriorityConfig(priority).bgColor;
}

export function getPriorityBorderColor(priority: string): string {
    return getPriorityConfig(priority).borderColor;
}


export function PriorityBadge({ priority }: { priority: string }) {
    const config = getPriorityConfig(priority);
    return (
        <span
            className="inline-flex py-1 px-3 justify-center items-center gap-1 rounded-full text-xs font-medium capitalize"
            style={{
                color: config.color,
                backgroundColor: config.bgColor,
                border: `1px solid ${config.borderColor}`,
            }}
        >
            {config.label}
        </span>
    );
}