"use client";

import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { toast } from "react-toastify";
import { PERMISSIONS } from "@/lib/permissions";
import { WashWithPurposeRow } from "./WashWithPurposeRow";
import { WashWithPurposeModal } from "./WashWithPurposeModal";
import {
  useGetFaqsQuery,
  useDeleteFaqMutation,
  useReorderFaqMutation,
  type WashWithPurposeFaq,
} from "@/services/washWithPurpose.api";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const SORT_OPTIONS = [
  { value: "display_order_asc", label: "Display order: Low to high" },
  { value: "display_order_desc", label: "Display order: High to low" },
  { value: "question_asc", label: "Question: A → Z" },
  { value: "question_desc", label: "Question: Z → A" },
];

export default function WashWithPurpose() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("display_order_asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<WashWithPurposeFaq | null>(null);
  const [localFaqs, setLocalFaqs] = useState<WashWithPurposeFaq[]>([]);

  const { data: faqs = [], isLoading, refetch } = useGetFaqsQuery();
  const [deleteFaq] = useDeleteFaqMutation();
  const [reorderFaqs] = useReorderFaqMutation();

  useEffect(() => {
    setLocalFaqs(faqs);
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    let items = [...localFaqs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      items = items.filter((faq) =>
        [faq.question, faq.ans]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query)),
      );
    }

    // Status filter
    if (statusFilter === "published") {
      items = items.filter((faq) => faq.is_publish);
    } else if (statusFilter === "draft") {
      items = items.filter((faq) => !faq.is_publish);
    }

    // Sort
    if (sortFilter === "display_order_asc") {
      items.sort((a, b) => a.display_order - b.display_order);
    } else if (sortFilter === "display_order_desc") {
      items.sort((a, b) => b.display_order - a.display_order);
    } else if (sortFilter === "question_asc") {
      items.sort((a, b) => a.question.localeCompare(b.question));
    } else if (sortFilter === "question_desc") {
      items.sort((a, b) => b.question.localeCompare(a.question));
    }

    return items;
  }, [localFaqs, searchQuery, statusFilter, sortFilter]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(searchInput);
    }
  };

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
  };

  const openNewModal = () => {
    setEditingFaq(null);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: WashWithPurposeFaq) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      await deleteFaq(id).unwrap();
      toast.success("FAQ deleted successfully");
      refetch();
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const draggedId = result.draggableId;

    const sourceIndexLocal = localFaqs.findIndex((s) => s.id === draggedId);
    if (sourceIndexLocal === -1) return;

    const visibleIds = filteredFaqs.map((s) => s.id);
    const destIndexVisible = result.destination.index;
    const destId = visibleIds[destIndexVisible];

    const items = Array.from(localFaqs);
    const [moved] = items.splice(sourceIndexLocal, 1);

    let insertIndexLocal = items.length;
    if (typeof destId !== "undefined") {
      const idxAfterRemoval = items.findIndex((s) => s.id === destId);
      insertIndexLocal =
        idxAfterRemoval === -1 ? items.length : idxAfterRemoval;
    } else if (visibleIds.length > 0) {
      const lastVisible = visibleIds[visibleIds.length - 1];
      const lastIdx = items.findIndex((s) => s.id === lastVisible);
      insertIndexLocal = lastIdx === -1 ? items.length : lastIdx + 1;
    }

    items.splice(insertIndexLocal, 0, moved);

    const updatedItems = items.map((item, idx) => ({
      ...item,
      display_order: idx + 1,
    }));

    setLocalFaqs(updatedItems);

    try {
      // Prepare reorder data
      const reorderData = updatedItems.map((it) => ({
        id: it.id,
        display_order: it.display_order,
      }));

      await reorderFaqs(reorderData).unwrap();
      toast.success("FAQ order updated successfully");
      refetch();
    } catch {
      toast.error("Failed to update FAQ order");
      setLocalFaqs(faqs);
    }
  };

  const handleSuccess = () => {
    refetch();
    closeModal();
  };

  return (
    <div className="flex w-full max-w-full flex-col gap-4 p-4">
      <div className="flex justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[#1D1F2C] font-inter text-xl font-semibold leading-[100%]">
            Wash with Purpose FAQs
          </h2>
          <p className="mt-1 text-sm text-[#777980]">
            Manage FAQs with icon upload and drag & drop reordering.
          </p>
        </div>

        <Button
          onClick={openNewModal}
          permission={PERMISSIONS.faq.create}
          className="w-auto! flex items-center gap-2 rounded-md bg-[#0098E8] px-4 py-2 text-white hover:bg-[#0088D8] transition-colors"
        >
          <Icon name="plus" width={16} height={16} color="white" />
          Add FAQ
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-55 max-w-105">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-4 pr-12 py-3 border border-[#E8E8E9] rounded-lg bg-white text-sm text-[#1B1B1B] placeholder-[#777980] font-inter outline-none focus:border-[#0098E8]"
          />
          <Button
            variant="icon"
            onClick={handleSearchClick}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-[#0098E8] hover:bg-[#0088D8] transition-colors"
          >
            <Icon name="search" width={16} height={16} color="white" />
          </Button>
        </div>

        <FilterDropdown
          label="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <div className="rounded-xl border border-[#DFE1E7] overflow-hidden bg-white">
        {isLoading ? (
          <div className="p-6 text-sm text-[#777980]">Loading FAQs...</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#777980]">
            No FAQs found. Adjust filters or add a new FAQ.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="faqs">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {filteredFaqs.map((faq, index) => (
                    <WashWithPurposeRow
                      key={faq.id}
                      faq={faq}
                      index={index}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <WashWithPurposeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        faq={editingFaq}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
