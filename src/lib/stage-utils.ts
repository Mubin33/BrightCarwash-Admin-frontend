import type { StageOption } from "@/components/ui/StageDropdown";
import type { Stage } from "@/types/stage";

export function mapStagesToOptions(stages: Stage[]): StageOption[] {
    const nameToValue: Record<string, string> = {
        "new lead": "new",
        contracted: "contracted",
        converted: "converted",
        lost: "lost",
    };

    return stages.map((s) => {
        const normalized = s.name.toLowerCase().replace(/\s+/g, "_");
        return {
            value: nameToValue[normalized] ?? normalized,
            label: s.name,
            color: s.color,
            stageId: s.id,
            icon: s.icon,
        };
    });
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
        return icon;
    }
    return `/icons/svgs/${icon}.svg`;
}

export function hexToTintedBg(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.12)`;
}
/**
 * Resolves the default stage option when opening lead creation forms.
 * Avoids any hardcoded database CUIDs (Audit Issue BUG-013).
 */
export function resolveDefaultStage(
    stages?: StageOption[],
    preferredStageId?: string,
    preferredStageName?: string
): { stageId: string; stageLabel: string } {
    if (preferredStageId && stages && stages.length > 0) {
        const found = stages.find((s) => s.stageId === preferredStageId);
        if (found) {
            return { stageId: found.stageId, stageLabel: found.label };
        }
    }
    if (preferredStageId) {
        return {
            stageId: preferredStageId,
            stageLabel:
                preferredStageName && preferredStageName !== "Select Stage"
                    ? preferredStageName
                    : "Select Stage",
        };
    }
    if (stages && stages.length > 0) {
        return { stageId: stages[0].stageId, stageLabel: stages[0].label };
    }
    return {
        stageId: "",
        stageLabel:
            preferredStageName && preferredStageName !== "Select Stage"
                ? preferredStageName
                : "Select Stage",
    };
}
