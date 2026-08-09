'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Icon } from '@/components/ui/Icon';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/lib/permissions';
import type { Section } from '@/types/section';

interface SectionRowProps {
    section: Section;
    index: number;
    onEdit: (section: Section) => void;
    onDelete: (section_key: string) => void;
}

export function SectionRow({ section, index, onEdit, onDelete }: SectionRowProps) {
    const canUpdate = usePermission(PERMISSIONS.section.update);
    const canDelete = usePermission(PERMISSIONS.section.delete);

    return (
        <Draggable draggableId={section.section_key} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex items-center bg-white/80 border-b border-[#E8E8E9] last:border-b-0 hover:bg-[#F8FAFB] transition-colors"
                >
                    <div
                        {...provided.dragHandleProps}
                        className="flex p-2 border-r border-[#E8E8E9] justify-center items-center gap-3 self-stretch cursor-grab active:cursor-grabbing w-13 shrink-0"
                    >
                        <Icon name="drag" width={20} height={20} color="#777980" />
                    </div>

                    <div className="flex-1 p-4 flex flex-col gap-1 border-r border-[#E8E8E9] min-w-0">
                        <span className="text-sm font-medium text-[#1B1B1B] truncate">{section.content.title || '-'}</span>
                        <span className="text-sm text-[#25272B] truncate">{section.content.subtitle || '-'}</span>
                    </div>
                   
                    <div className="flex p-3 items-center justify-center gap-3 self-stretch border-r border-[#E8E8E9] w-30 shrink-0">
                        <span className={`inline-flex py-1 px-3 justify-center items-center rounded-full text-xs font-medium ${section.is_active ? 'bg-[#DCF7EA] text-[#006F1F]' : 'bg-[#F1F1F1] text-[#777980]'}`}>
                            {section.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="flex p-3 justify-center items-center gap-2 self-stretch w-22 shrink-0">
                        {canUpdate && (
                            <button
                                onClick={() => onEdit(section)}
                                className="flex p-1.5 justify-center items-center gap-3 rounded-md border border-[#E8E8E9] bg-white hover:bg-[#F8FAFB] hover:border-[#0098E8] transition-all"
                                type="button"
                                aria-label="Edit section"
                            >
                                <Icon name="edit" width={20} height={20} color="#0B1220" />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={() => onDelete(section.section_key)}
                                className="flex p-1.5 justify-center items-center gap-3 rounded-md border border-[#E8E8E9] bg-white hover:bg-[#FFE6E6] hover:border-[#FF4345] transition-all"
                                type="button"
                                aria-label="Delete section"
                            >
                                <Icon name="delete" width={20} height={20} color="#FF4345" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
}
