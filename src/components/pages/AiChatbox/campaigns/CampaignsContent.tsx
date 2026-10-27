"use client";

import { Pagination } from "@/components/ui/Pagination";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import {
  useCreateCampaignMutation,
  useDeleteCampaignMutation,
  useGetCampaignDetailQuery,
  useGetCampaignsQuery,
  useUpdateCampaignMutation,
} from "@/services/ai-campaign.api";
import type { Campaign } from "@/types/ai-campaign";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  CampaignCard,
  CampaignCreateModal,
  CampaignFilters,
  CampaignHeader,
  CampaignSkeleton,
  CampaignViewModal,
  DeleteCampaignModal,
} from "./";

const ITEMS_PER_PAGE = 6;

export function CampaignsContent() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  );
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("Newest First");
  const [currentPage, setCurrentPage] = useState(1);

  // Granular chatbot campaign permissions with fallback for admin
  const canCreate = usePermission([
    PERMISSIONS.chatbot_campaign.create,
    "chatbot_campaign:*",
  ]);
  const canUpdate = usePermission([
    PERMISSIONS.chatbot_campaign.update,
    "chatbot_campaign:*",
  ]);
  const canDelete = usePermission([
    PERMISSIONS.chatbot_campaign.delete,
    "chatbot_campaign:*",
  ]);
  const canChangeStatus = usePermission([
    PERMISSIONS.chatbot_campaign.change_status,
    "chatbot_campaign:*",
  ]);

  const { data: campaigns, isLoading, refetch } = useGetCampaignsQuery();
  const { data: campaignDetail, isLoading: isDetailLoading } =
    useGetCampaignDetailQuery(selectedCampaignId!, {
      skip: !selectedCampaignId,
    });
  const [createCampaign, { isLoading: isCreating }] =
    useCreateCampaignMutation();
  const [updateCampaign, { isLoading: isUpdating }] =
    useUpdateCampaignMutation();
  const [deleteCampaign, { isLoading: isDeleting }] =
    useDeleteCampaignMutation();

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];

    let filtered = [...campaigns];

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter === "Active") {
      filtered = filtered.filter((c) => c.is_active);
    } else if (statusFilter === "Inactive") {
      filtered = filtered.filter((c) => !c.is_active);
    }

    if (sortBy === "Newest First") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else {
      filtered.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    }

    return filtered;
  }, [campaigns, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleCreate = async (data: {
    title: string;
    description: string;
    image?: File | null;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
  }) => {
    if (!canCreate) {
      toast.error("You do not have permission to create campaigns");
      return;
    }
    try {
      await createCampaign({
        ...data,
        is_active: canChangeStatus ? data.is_active : true,
      }).unwrap();
      toast.success("Campaign created successfully");
      setIsCreateModalOpen(false);
      refetch();
    } catch {
      toast.error("Failed to create campaign");
    }
  };

  const handleUpdate = async (
    id: number,
    data: {
      title: string;
      description: string;
      image?: File | null;
      is_active: boolean;
      start_date?: string;
      end_date?: string;
    },
  ) => {
    if (!canUpdate) {
      toast.error("You do not have permission to update campaigns");
      return;
    }
    try {
      await updateCampaign({ id, ...data }).unwrap();
      toast.success("Campaign updated successfully");
      refetch();
    } catch {
      toast.error("Failed to update campaign");
    }
  };

  const handleDeleteClick = (campaignOrId: Campaign | number) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete campaigns");
      return;
    }
    if (typeof campaignOrId === "number") {
      const found =
        campaigns?.find((c) => c.id === campaignOrId) ||
        (campaignDetail?.id === campaignOrId ? campaignDetail : null);
      if (found) {
        setCampaignToDelete(found);
      }
    } else {
      setCampaignToDelete(campaignOrId);
    }
  };

  const handleConfirmDelete = async () => {
    if (!canDelete) {
      toast.error("You do not have permission to delete campaigns");
      return;
    }
    if (!campaignToDelete) return;
    try {
      await deleteCampaign(campaignToDelete.id).unwrap();
      toast.success("Campaign deleted successfully");
      if (isViewModalOpen && selectedCampaignId === campaignToDelete.id) {
        setIsViewModalOpen(false);
        setSelectedCampaignId(null);
      }
      setCampaignToDelete(null);
      refetch();
    } catch {
      toast.error("Failed to delete campaign");
    }
  };

  const handleView = (id: number) => {
    setSelectedCampaignId(id);
    setIsViewModalOpen(true);
  };

  const handleCloseView = () => {
    setIsViewModalOpen(false);
    setSelectedCampaignId(null);
  };

  if (isLoading) {
    return <CampaignSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col items-start gap-6 w-full">
        <CampaignHeader
          onNewCampaignClick={() => setIsCreateModalOpen(true)}
          canCreate={canCreate}
        />

        <div className="flex flex-col gap-4 w-full">
          <CampaignFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {paginatedCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onView={handleView}
                onDelete={handleDeleteClick}
                isDeleting={isDeleting}
                canDelete={canDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      <CampaignCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
        isCreating={isCreating}
        canChangeStatus={canChangeStatus}
      />

      <CampaignViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseView}
        campaign={campaignDetail || null}
        isLoading={isDetailLoading}
        onUpdate={handleUpdate}
        onDelete={handleDeleteClick}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        canUpdate={canUpdate}
        canDelete={canDelete}
        canChangeStatus={canChangeStatus}
      />

      <DeleteCampaignModal
        isOpen={!!campaignToDelete}
        onClose={() => {
          if (!isDeleting) setCampaignToDelete(null);
        }}
        campaign={campaignToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}