"use client";
import type { Item } from "@/types/queries";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useParams } from "@/hooks/useParams";
import {
  useDeleteQuoteMutation,
  useGetQuotesQuery,
  useQueriesDetailQuery,
  useUpdateStatusMutation,
} from "@/services/queries.api";
import { format } from "date-fns";
import { Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import QueryDetailPanel from "./QueryDetailPanel";

export default function Queries() {
  const router = useRouter();
  const [queryState, setQueryState] = useParams({
    status: "",
    search: "",
    page: "1",
    limit: "10",
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedQueryId, setSelectedQueryId] = useState<string>("");
  const [searchInput, setSearchInput] = useState(queryState.search);
  const [queryToDelete, setQueryToDelete] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: quotesData,
    isLoading: quotesLoading,
    refetch: quotesRefetch,
  } = useGetQuotesQuery({
    page: parseInt(queryState.page),
    limit: parseInt(queryState.limit),
    status: queryState.status,
    search: queryState.search,
  });

  const { data: queryDetail } =
    useQueriesDetailQuery({ id: selectedQueryId }, { skip: !selectedQueryId });

  const [updateStatus] = useUpdateStatusMutation();
  const [deleteQuote] = useDeleteQuoteMutation();

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateStatus({ id, status });
    quotesRefetch();
  };

  const handleDeleteClick = (itemOrId: Item | string) => {
    if (typeof itemOrId === "string") {
      const found =
        data.find((item) => item.id === itemOrId) ||
        (queryDetail?.data?.id === itemOrId
          ? ({
              ...queryDetail.data,
              description: queryDetail.data.description ?? null,
            } as Item)
          : null);

      if (found) {
        setQueryToDelete(found);
      } else {
        setQueryToDelete({
          id: itemOrId,
          full_name: "Query",
          email: "",
          phone: "",
          vehicle: "",
          status: "new",
          description: null,
          created_at: "",
          updated_at: "",
          date: new Date().toISOString(),
        });
      }
    } else {
      setQueryToDelete(itemOrId);
    }
  };

  const handleConfirmDelete = async () => {
    if (!queryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteQuote({ id: queryToDelete.id }).unwrap();
      toast.success("Query deleted successfully");
      if (isPanelOpen && selectedQueryId === queryToDelete.id) {
        setIsPanelOpen(false);
      }
      setQueryToDelete(null);
      quotesRefetch();
    } catch (error) {
      console.error("Failed to delete query:", error);
      toast.error("Failed to delete query. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedQueryId(id);
    setIsPanelOpen(true);
    quotesRefetch();
  };

  const handleSendEmail = (email: string) => {
    const params = new URLSearchParams({ to: email });
    router.push(`/marketing/email-list/create?${params.toString()}`);
  };

  const handleSearchSubmit = () => {
    setQueryState({ search: searchInput, page: "1" });
  };

  const columns = [
    {
      key: "full_name",
      header: "Full Name",
    },
    {
      key: "phone",
      header: "Phone Number",
    },
    {
      key: "email",
      header: "Email Address",
    },
    {
      key: "vehicle",
      header: "Vehicle",
    },
    {
      key: "status",
      header: "Status",
      render: (row: Item) => {
        const statusStyles: Record<string, string> = {
          new: "bg-[#E6F5FD] text-[#0098E8]",
          replied: "bg-[#DCF7EA] text-[#006F1F]",
          closed: "bg-[#FFE6E6] text-[#FF4345]",
        };
        const selectedStatusClass =
          statusStyles[row.status] || "bg-[#F5F5F5] text-[#111827]";

        return (
          <div>
            <FilterDropdown
              label="Status"
              options={[
                { value: "new", label: "New" },
                { value: "replied", label: "Replied" },
                { value: "closed", label: "Closed" },
              ]}
              value={row.status}
              onChange={(value) => {
                handleUpdateStatus(row.id, value || "");
              }}
              className="w-fit"
              buttonClassName={`rounded-full border-none px-3 py-1.5 text-sm font-medium ${selectedStatusClass}`}
            />
          </div>
        );
      },
    },
    {
      key: "date",
      header: "Date",
      render: (row: Item) => {
        try {
          return format(new Date(row.date), "d MMM, yyyy");
        } catch {
          return row.date || "";
        }
      },
    },
    {
      key: "action",
      header: "Action",
      className: "w-12",
      render: (row: Item) => (
        <ActionsDropdown
          items={[
            {
              label: "View Details",
              onClick: () => handleViewDetails(row.id),
            },
            {
              label: "Send email",
              onClick: () => {
                handleViewDetails(row.id);
              },
            },
            {
              label: "Delete query",
              onClick: () => handleDeleteClick(row),
              variant: "danger" as const,
            },
          ]}
        />
      ),
    },
  ];

  const data =
    quotesData?.data?.items?.map((item) => ({
      ...item,
      status: item.status || "new",
    })) || [];

  const totalItems = quotesData?.data?.meta?.total || 0;
  const itemsPerPage = parseInt(queryState.limit);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  return (
    <div>
      <h2 className="text-[#0B1220] font-lora text-lg xl:text-2xl font-semibold mb-4 lg:mb-8">
        Website Queries Overview
      </h2>

      <div className="mb-3 flex justify-between items-center">
        <div className="relative flex-1 max-w-100">
          <input
            className="w-full border border-[#E8E8E9] rounded-lg text-sm py-3 pl-4 pr-12 outline-none"
            placeholder="Search by name, phone number, email..."
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
          />
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-[#0098E8] text-white hover:bg-[#0088D8] transition-colors"
          >
            <Search size={16} />
          </button>
        </div>
        <FilterDropdown
          label="All Status"
          options={[
            { value: "new", label: "New" },
            { value: "replied", label: "Replied" },
            { value: "closed", label: "Closed" },
          ]}
          dropdownOffsetX={-80}
          value={queryState.status}
          onChange={(value) =>
            setQueryState({ status: value || "", page: "1" })
          }
          className="w-fit left-0"
        />
      </div>

      <div>
        <DataTable
          columns={columns}
          data={data}
          rowKey={(item) => item.id}
          className={`w-full border border-[#E8E8E9] ${totalPages > 1 ? "rounded-t-lg" : "rounded-lg"}`}
        />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end items-center p-4 border-b border-x border-[#E8E8E9] rounded-b-lg relative">
          <Pagination
            currentPage={parseInt(queryState.page)}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setQueryState({ page: page.toString() })}
            isLoading={quotesLoading}
          />
        </div>
      )}

      <QueryDetailPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        data={queryDetail?.data ?? null}
        onStatusChange={handleUpdateStatus}
        onSendEmail={handleSendEmail}
        onDelete={handleDeleteClick}
      />

      <Modal
        isOpen={!!queryToDelete}
        onClose={() => {
          if (!isDeleting) setQueryToDelete(null);
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3F2] flex items-center justify-center shrink-0">
              <Trash2 className="text-[#D92D20]" size={20} />
            </div>
            <div>
              <span className="text-[#1B1B1B] font-inter text-lg font-semibold">
                Delete Query
              </span>
              <p className="text-[#777980] font-inter text-xs">
                Confirm query deletion
              </p>
            </div>
          </div>
        }
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[#475467] text-sm leading-relaxed">
            Are you sure you want to delete this query? This action cannot be undone.
          </p>

          {queryToDelete && (
            <div className="p-3.5 rounded-xl border border-[#DFE1E7] bg-[#F8FAFB] flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#1B1B1B] font-semibold text-sm truncate">
                  {queryToDelete.full_name || "Unnamed"}
                </span>
                {queryToDelete.vehicle && (
                  <span className="px-2 py-0.5 rounded-full bg-[#E6F5FD] text-[#0098E8] font-medium text-[11px] shrink-0">
                    {queryToDelete.vehicle}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 text-[#777980] text-[12px]">
                {queryToDelete.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[#98A2B3]">Email:</span>
                    <span className="text-[#344054] font-medium truncate">
                      {queryToDelete.email}
                    </span>
                  </div>
                )}
                {queryToDelete.phone && (
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[#98A2B3]">Phone:</span>
                    <span className="text-[#344054] font-medium">
                      {queryToDelete.phone}
                    </span>
                  </div>
                )}
                {queryToDelete.date && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#98A2B3]">Date:</span>
                    <span className="text-[#344054]">
                      {(() => {
                        try {
                          return format(new Date(queryToDelete.date), "d MMM, yyyy");
                        } catch {
                          return queryToDelete.date;
                        }
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-3 border-t border-[#E8E8E9]">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isDeleting) setQueryToDelete(null);
              }}
              disabled={isDeleting}
              className="px-5 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              loadingText="Deleting..."
              className="px-5 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-white"
            >
              Delete Query
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
