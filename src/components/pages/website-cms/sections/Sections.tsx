"use client";

import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { SectionModal } from "./SectionModal";
import { SectionRow } from "./SectionRow";
import {
  useDeleteSectionMutation,
  useGetSectionsQuery,
  useUpdateSectionMutation,
} from "@/services/sections.api";
import type { Section } from "@/types/section";
import { toast } from "react-toastify";
import { PERMISSIONS } from "@/lib/permissions";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const SORT_OPTIONS = [
  { value: "sort_order_desc", label: "Sort order: High to low" },
  { value: "sort_order_asc", label: "Sort order: Low to high" },
  { value: "section_key_asc", label: "Section key: A → Z" },
  { value: "section_key_desc", label: "Section key: Z → A" },
];

export default function Sections() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("sort_order_desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [localSections, setLocalSections] = useState<Section[]>([]);

  const {
    data: sections = [],
    isLoading,
    refetch,
  } = useGetSectionsQuery(undefined);
  const [deleteSection] = useDeleteSectionMutation();
  const [updateSection] = useUpdateSectionMutation();

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  const filteredSections = useMemo(() => {
    let items = [...localSections];

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      items = items.filter((section) =>
        [
          section.section_key,
          section.section_type,
          section.content.title,
          section.content.subtitle,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query)),
      );
    }

    if (statusFilter === "active") {
      items = items.filter((section) => section.is_active);
    } else if (statusFilter === "inactive") {
      items = items.filter((section) => !section.is_active);
    }

    if (sortFilter === "sort_order_asc") {
      items.sort((a, b) => a.sort_order - b.sort_order);
    } else if (sortFilter === "sort_order_desc") {
      items.sort((a, b) => b.sort_order - a.sort_order);
    } else if (sortFilter === "section_key_asc") {
      items.sort((a, b) => a.section_key.localeCompare(b.section_key));
    } else if (sortFilter === "section_key_desc") {
      items.sort((a, b) => b.section_key.localeCompare(a.section_key));
    }

    return items;
  }, [localSections, searchQuery, statusFilter, sortFilter]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(searchInput);
    }
  };

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
  };

  const openNewModal = () => {
    setEditingSection(null);
    setIsModalOpen(true);
  };

  const openEditModal = (section: Section) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
  };

  const handleDelete = async (section_key: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      await deleteSection({ key: section_key }).unwrap();
      toast.success("Section deleted successfully");
      refetch();
    } catch {
      toast.error("Failed to delete section");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index + 1,
    }));

    setLocalSections(updatedItems);

    try {
      await Promise.all(
        updatedItems.map((item) =>
          updateSection({
            key: item.section_key,
            data: { sort_order: item.sort_order },
          }).unwrap(),
        ),
      );
      toast.success("Section order updated successfully");
      refetch();
    } catch {
      toast.error("Failed to update section order");
      setLocalSections(sections);
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
            Website Sections
          </h2>
          <p className="mt-1 text-sm text-[#777980]">
            Manage sections using the same list and editor flow as FAQ.
          </p>
        </div>

        <Button
          onClick={openNewModal}
          permission={PERMISSIONS.section.create}
          className="w-auto! flex items-center gap-2 rounded-md bg-[#0098E8] px-4 py-2 text-white hover:bg-[#0088D8] transition-colors"
        >
          <Icon name="plus" width={16} height={16} color="white" />
          Add Section
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-55 max-w-105">
          <input
            type="text"
            placeholder="Search sections..."
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

        <FilterDropdown
          label="Sort by"
          options={SORT_OPTIONS}
          value={sortFilter}
          onChange={setSortFilter}
        />
      </div>

      <div className="rounded-xl border border-[#DFE1E7] overflow-hidden bg-white">
        

        {isLoading ? (
          <div className="p-6 text-sm text-[#777980]">Loading sections...</div>
        ) : filteredSections.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#777980]">
            No sections found. Adjust filters or add a new section.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {filteredSections.map((section, index) => (
                    <SectionRow
                      key={section.section_key}
                      section={section}
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

      <SectionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        section={editingSection}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
