"use client";

import { Button } from "@/components/ui/Button";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { Modal } from "@/components/ui/Modal";
import type { StageOption } from "@/components/ui/StageDropdown";
import {
  useConnectLeadsToGroupMutation,
  useCreateLeadMutation,
  useGetNonGroupLeadsQuery,
} from "@/services/leads.api";
import type { Lead, LeadDepositStatus } from "@/types/leads";
import { Check, Loader2, Search, UserPlus, Users, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

interface AddGroupMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string | null;
  groupName?: string;
  existingLeadIds?: string[];
  stages?: StageOption[];
  onSuccess?: () => void;
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export function AddGroupMemberModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  existingLeadIds = [],
  stages = [],
  onSuccess,
}: AddGroupMemberModalProps) {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Lead Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [source, setSource] = useState("");
  const [deposit, setDeposit] = useState<number>(0);
  const [depositStatus, setDepositStatus] = useState<LeadDepositStatus>("NONE");
  const [priority, setPriority] = useState<string>("MEDIUM");

  const defaultStageId = stages[0]?.stageId || "cmqhw9c130002q4tmw3f71hpt";
  const defaultStageLabel = stages[0]?.label || "New Lead";
  const [currentStageId, setCurrentStageId] = useState(defaultStageId);
  const [currentStageLabel, setCurrentStageLabel] = useState(defaultStageLabel);

  const prevIsOpenRef = useRef(false);

  const [connectLeads] = useConnectLeadsToGroupMutation();
  const [createLead] = useCreateLeadMutation();

  // Fetch existing leads from system
  const { data: paginatedLeads, isLoading: isLeadsLoading } =
    useGetNonGroupLeadsQuery(
      {
        id: groupId || "",
        page: 1,
        limit: 5,
        search: searchQuery,
      },
      { skip: !isOpen },
    );

  const allLeads: Lead[] = useMemo(
    () => paginatedLeads?.data || [],
    [paginatedLeads],
  );

  // Reset when modal opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setActiveTab("existing");
      setSelectedLeadIds([]);
      setSearchQuery("");
      setName("");
      setPhone("");
      setEmail("");
      setService("");
      setVehicle("");
      setSource("");
      setDeposit(0);
      setDepositStatus("NONE");
      setPriority("MEDIUM");
      if (stages[0]) {
        setCurrentStageId(stages[0].stageId);
        setCurrentStageLabel(stages[0].label);
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, stages]);

  // Available leads (exclude or identify leads already in this group)
  const availableLeads = useMemo(() => {
    return allLeads.filter((lead) => !existingLeadIds.includes(lead.id));
  }, [allLeads, existingLeadIds]);

  // Filter available leads by search
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return availableLeads;
    const q = searchQuery.toLowerCase().trim();
    return availableLeads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        (lead.phone && lead.phone.toLowerCase().includes(q)) ||
        (lead.service && lead.service.toLowerCase().includes(q)),
    );
  }, [availableLeads, searchQuery]);

  const handleToggleLead = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId],
    );
  };

  const handleToggleSelectAll = () => {
    const filteredIds = filteredLeads.map((l) => l.id);
    const allFilteredSelected = filteredIds.every((id) =>
      selectedLeadIds.includes(id),
    );

    if (allFilteredSelected) {
      setSelectedLeadIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id)),
      );
    } else {
      const newSelections = Array.from(
        new Set([...selectedLeadIds, ...filteredIds]),
      );
      setSelectedLeadIds(newSelections);
    }
  };

  const isAllFilteredSelected =
    filteredLeads.length > 0 &&
    filteredLeads.every((lead) => selectedLeadIds.includes(lead.id));

  // Submit for Tab 1: Connect Existing Leads
  const handleConnectExisting = async () => {
    if (!groupId) {
      toast.error("Group ID is missing");
      return;
    }

    if (selectedLeadIds.length === 0) {
      toast.warning("Please select at least one lead");
      return;
    }

    setIsSubmitting(true);
    try {
      await connectLeads({
        groupId,
        leadIds: selectedLeadIds,
      }).unwrap();

      toast.success(
        `Added ${selectedLeadIds.length} member${selectedLeadIds.length !== 1 ? "s" : ""} to group`,
      );
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMsg =
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add members to group";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit for Tab 2: Create Brand New Lead & Connect to Group
  const handleCreateNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) {
      toast.error("Group ID is missing");
      return;
    }

    if (!name || !phone || !email || !service || !vehicle || !source) {
      toast.warning("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedPhone = phone.startsWith("+")
        ? phone
        : `+880${phone.trim()}`;

      // 1. Create lead
      const newLead = await createLead({
        name,
        email,
        phone: formattedPhone,
        service,
        vehicle,
        source,
        priority: priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        deposit_status: depositStatus,
        stage_name: currentStageLabel,
        stage: currentStageLabel.toLowerCase().replace(/\s+/g, "_"),
      }).unwrap();

      // 2. Connect new lead to group
      if (newLead?.id) {
        await connectLeads({
          groupId,
          leadIds: [newLead.id],
        }).unwrap();
      }

      toast.success(`Created & added ${name} to group`);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMsg =
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create and add member";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stageOptions =
    stages.length > 0
      ? stages.map((s) => ({ value: s.stageId, label: s.label }))
      : [{ value: defaultStageId, label: defaultStageLabel }];

  const handleStageChange = (selectedValue: string) => {
    const selected = stageOptions.find((o) => o.value === selectedValue);
    if (selected) {
      setCurrentStageId(selected.value);
      setCurrentStageLabel(selected.label);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 text-sm font-inter border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Users size={20} className="text-[#0098E8]" />
          <span>Add Members to Group {groupName ? `"${groupName}"` : ""}</span>
        </div>
      }
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* Dual Tabs */}
        <div className="flex rounded-xl bg-[#F4F5F7] p-1 border border-[#DFE1E7]">
          <button
            type="button"
            onClick={() => setActiveTab("existing")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "existing"
                ? "bg-white text-[#0098E8] shadow-sm"
                : "text-[#777980] hover:text-[#1B1B1B]"
            }`}
          >
            <Users size={16} />
            Select Existing Leads
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "new"
                ? "bg-white text-[#0098E8] shadow-sm"
                : "text-[#777980] hover:text-[#1B1B1B]"
            }`}
          >
            <UserPlus size={16} />
            Create New Lead
          </button>
        </div>

        {/* TAB 1: Select Existing Leads */}
        {activeTab === "existing" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#1B1B1B] font-inter text-xs sm:text-sm font-semibold">
                  Available Leads
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#EBF6FD] text-[#0098E8] border border-[#BCE3FA]">
                  {selectedLeadIds.length} selected
                </span>
              </div>

              {filteredLeads.length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-xs font-inter text-[#0098E8] hover:text-[#007BB8] font-medium transition-colors cursor-pointer"
                >
                  {isAllFilteredSelected
                    ? "Deselect All Filtered"
                    : "Select All Filtered"}
                </button>
              )}
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777980] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by name, email, phone, or service..."
                className="w-full pl-9 pr-9 py-2 border border-[#DFE1E7] rounded-lg bg-[#F8FAFB] text-[#1B1B1B] placeholder-[#777980] font-inter text-xs sm:text-sm outline-none focus:bg-white focus:border-[#0098E8] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777980] hover:text-[#1B1B1B]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Scrollable list */}
            <div className="border border-[#DFE1E7] rounded-xl overflow-hidden bg-white">
              <div className="max-h-60 overflow-y-auto divide-y divide-[#F0F1F3]">
                {isLeadsLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-sm text-[#777980]">
                    <Loader2
                      size={18}
                      className="animate-spin text-[#0098E8]"
                    />
                    Loading leads...
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="py-8 text-center text-xs sm:text-sm text-[#777980]">
                    {availableLeads.length === 0
                      ? "All system leads are already added to this group."
                      : "No leads found matching your search."}
                  </div>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedLeadIds.includes(lead.id);
                    return (
                      <div
                        key={lead.id}
                        onClick={() => handleToggleLead(lead.id)}
                        className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#F0F8FE] hover:bg-[#E7F3FD]"
                            : "hover:bg-[#F8FAFB]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-[#0098E8] border-[#0098E8] text-white"
                                : "border-[#DFE1E7] bg-white"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>

                          <div className="w-7 h-7 rounded-full bg-[#EBF6FD] text-[#0098E8] font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-[#DFE1E7]">
                            {lead.avatar &&
                            lead.avatar !== "/images/avatar-placeholder.png" ? (
                              <Image
                                src={lead.avatar}
                                alt={lead.name}
                                width={28}
                                height={28}
                                className="object-cover"
                              />
                            ) : (
                              lead.name.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-[#1B1B1B] truncate">
                              {lead.name}
                            </span>
                            <span className="text-xs text-[#777980] truncate">
                              {lead.email || lead.phone || "No contact info"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {lead.service && (
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F5F7] text-[#4B4D54] max-w-[120px] truncate">
                              {lead.service}
                            </span>
                          )}
                          {lead.stage && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EBF6FD] text-[#0098E8] capitalize">
                              {lead.stage.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex gap-3 justify-end pt-3 border-t border-[#DFE1E7]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6 w-auto!"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnectExisting}
                isLoading={isSubmitting}
                loadingText="Adding..."
                className="px-6 w-auto! bg-[#0098E8] hover:bg-[#0088D8] text-white"
                disabled={selectedLeadIds.length === 0 || isSubmitting}
              >
                Add Selected ({selectedLeadIds.length})
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: Create Brand New Lead Form */}
        {activeTab === "new" && (
          <form
            onSubmit={handleCreateNewLead}
            className="flex flex-col gap-3.5"
          >
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#1B1B1B] mb-1">
                Full Name <span className="text-[#FF4345]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. John Doe"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1B1B1B] mb-1">
                  Phone <span className="text-[#FF4345]">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="01328908206"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1B1B1B] mb-1">
                  Email <span className="text-[#FF4345]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1B1B1B] mb-1">
                  Service <span className="text-[#FF4345]">*</span>
                </label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  required
                  placeholder="e.g. Full Detail, Ceramic Coating"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1B1B1B] mb-1">
                  Vehicle <span className="text-[#FF4345]">*</span>
                </label>
                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  required
                  placeholder="e.g. Tesla Model 3"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1B1B1B] mb-1">
                  Source <span className="text-[#FF4345]">*</span>
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                  placeholder="Website, Referral"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1B1B1B] mb-1">
                  Priority
                </label>
                <FilterDropdown
                  label="Medium"
                  options={PRIORITY_OPTIONS}
                  value={priority}
                  onChange={(val: string) => setPriority(val)}
                  fullWidth
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1B1B1B] mb-1">
                  Deposit
                </label>
                <FilterDropdown
                  label="None"
                  options={[
                    { value: "PAID", label: "Paid" },
                    { value: "PENDING", label: "Pending" },
                    { value: "REFUNDED", label: "Refunded" },
                    { value: "NONE", label: "None" },
                  ]}
                  value={depositStatus}
                  onChange={(val: string) =>
                    setDepositStatus(val as LeadDepositStatus)
                  }
                  fullWidth
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#1B1B1B] mb-1">
                  Stage
                </label>
                <FilterDropdown
                  label="Select stage"
                  options={stageOptions}
                  value={currentStageId}
                  onChange={handleStageChange}
                  fullWidth
                  scrollable
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex gap-3 justify-end pt-3 border-t border-[#DFE1E7]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6 w-auto!"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                loadingText="Creating..."
                className="px-6 w-auto! bg-[#0098E8] hover:bg-[#0088D8] text-white"
                disabled={isSubmitting}
              >
                Create & Add to Group
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
