import type { StageOption } from "@/components/ui/StageDropdown";
import type { Stage } from "@/types/stage";

export function mapStagesToOptions(stages: Stage[]): StageOption[] {
    const nameToValue: Record<string, string> = {
        "new lead": "new",
        contracted: "contracted",
        converted: "converted",
        lost: "lost",
    };
    return stages.map((s) => ({
        value: nameToValue[s.name.toLowerCase()] ?? s.name.toLowerCase().replace(/\s+/g, "_"),
        label: s.name,
        color: s.color,
        stageId: s.id,
        icon: s.icon,
    }));
}

export function getDefaultStageIcon(stageName: string): string {
    const nameToIcon: Record<string, string> = {
        'new lead': 'kanban-new',
        'new': 'kanban-new',
        'contracted': 'kanban-contract',
        'converted': 'kanban-convert',
        'lost': 'kanban-lost',
    };
    return nameToIcon[stageName.toLowerCase()] || 'kanban-new';
}
export function getStageIconUrl(icon: string): string {
    if (!icon) return '';

    if (icon.startsWith('http://') || icon.startsWith('https://')) {
        // ✅ Fix double slash in URL
        return icon.replace(/(https?:\/\/[^\/]+)\/+/g, '$1/');
    }
    return `/icons/svgs/${icon}.svg`;
}

export function hexToTintedBg(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.12)`;
}