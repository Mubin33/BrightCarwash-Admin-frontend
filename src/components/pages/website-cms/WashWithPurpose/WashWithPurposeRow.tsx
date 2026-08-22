"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Icon } from "@/components/ui/Icon";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import type { WashWithPurposeFaq } from "@/services/washWithPurpose.api";

interface WashWithPurposeRowProps {
  faq: WashWithPurposeFaq;
  index: number;
  isDragDisabled: boolean;
  onEdit: (faq: WashWithPurposeFaq) => void;
  onDelete: (id: string) => void;
}

export function WashWithPurposeRow({
  faq,
  index,
  isDragDisabled,
  onEdit,
  onDelete,
}: WashWithPurposeRowProps) {
  const canUpdate = usePermission(PERMISSIONS.faq.update);
  const canDelete = usePermission(PERMISSIONS.faq.delete);

  return (
    <Draggable draggableId={faq.id} index={index} isDragDisabled={isDragDisabled}>
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
            <span className="text-sm font-medium text-[#1B1B1B] truncate">
              {faq?.question || "-"}
            </span>
            <span className="text-sm text-[#25272B] truncate">
              {faq?.ans || "-"}
            </span>
          </div>

          <div className="flex p-3 items-center justify-center gap-3 self-stretch border-r border-[#E8E8E9] w-30 shrink-0">
            <span
              className={`inline-flex py-1 px-3 justify-center items-center rounded-full text-xs font-medium ${faq.is_publish ? "bg-[#DCF7EA] text-[#006F1F]" : "bg-[#F1F1F1] text-[#777980]"}`}
            >
              {faq?.is_publish ? "Published" : "Draft"}
            </span>
          </div>

          <div className="flex p-3 justify-center items-center gap-2 self-stretch w-22 shrink-0">
            {canUpdate && (
              <button
                onClick={() => onEdit(faq)}
                className="flex p-1.5 justify-center items-center gap-3 rounded-md border border-[#E8E8E9] bg-white hover:bg-[#F8FAFB] hover:border-[#0098E8] transition-all"
                type="button"
                aria-label="Edit FAQ"
              >
                <Icon name="edit" width={20} height={20} color="#0B1220" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(faq.id)}
                className="flex p-1.5 justify-center items-center gap-3 rounded-md border border-[#E8E8E9] bg-white hover:bg-[#FFE6E6] hover:border-[#FF4345] transition-all"
                type="button"
                aria-label="Delete FAQ"
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
