"use client";
import { DataTable } from "@/components/ui/DataTable";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { useQueriesDetailQuery } from "@/services/queries.api";
import {
  useDeleteQuoteMutation,
  useGetQuotesQuery,
  useUpdateStatusMutation,
} from "@/services/queries.api";
import { Search } from "lucide-react";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/Pagination";
import { useParams } from "@/hooks/useParams";
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

  const { data: queryDetail, isLoading: queryDetailLoading } =
    useQueriesDetailQuery({ id: selectedQueryId }, { skip: !selectedQueryId });

  const [updateStatus] = useUpdateStatusMutation();
  const [deleteQuote] = useDeleteQuoteMutation();

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateStatus({ id, status });
    quotesRefetch();
  };

  const handleDeleteQuote = async (id: string) => {
    await deleteQuote({ id });
    quotesRefetch();
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
      render: (row: any) => {
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
      render: (row: any) => format(new Date(row.date), "d MMM, yyyy") || "",
    },
    {
      key: "action",
      header: "Action",
      className: "w-12",
      render: (row: any) => (
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
              onClick: () => handleDeleteQuote(row.id),
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
        data={queryDetail?.data}
        onStatusChange={handleUpdateStatus}
        onSendEmail={handleSendEmail}
        onDelete={handleDeleteQuote}
      />
    </div>
  );
}