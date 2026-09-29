"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Trash2, Users, AlertTriangle } from "lucide-react";
import type { Lead } from "@/types/leads";

interface GroupInfo {
  id: string;
  name: string;
  leadIds: string[];
  _count?: { leads: number };
}

interface DeleteGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupInfo | null;
  initialMembers?: Lead[];
  fetchGroupLeads: (
    groupId: string,
    page?: number,
    limit?: number,
    force?: boolean,
  ) => Promise<Lead[]>;
  onConfirmDelete: (groupId: string) => Promise<void> | void;
}

export function DeleteGroupModal({
  isOpen,
  onClose,
  group,
  initialMembers = [],
  fetchGroupLeads,
  onConfirmDelete,
}: DeleteGroupModalProps) {
  const [members, setMembers] = useState<Lead[]>(initialMembers);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [prevGroupId, setPrevGroupId] = useState(group?.id);

  // Sync state when group changes without calling setState in effect
  if (group?.id !== prevGroupId) {
    setPrevGroupId(group?.id);
    setMembers(initialMembers);
    setIsLoadingMembers(false);
  }

  const fetchGroupLeadsRef = useRef(fetchGroupLeads);
  useEffect(() => {
    fetchGroupLeadsRef.current = fetchGroupLeads;
  }, [fetchGroupLeads]);

  const fetchedGroupIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen || !group?.id) {
      fetchedGroupIdRef.current = null;
      return;
    }

    // If initial members already exist from cache/parent, use them directly
    if (initialMembers.length > 0) {
      fetchedGroupIdRef.current = group.id;
      return;
    }

    // Prevent duplicate fetch for the same group in this session
    if (fetchedGroupIdRef.current === group.id) {
      return;
    }

    let isCancelled = false;
    fetchedGroupIdRef.current = group.id;

    Promise.resolve().then(() => {
      if (!isCancelled) {
        setIsLoadingMembers(true);
      }
    });

    fetchGroupLeadsRef.current(group.id, 1, 50, false)
      .then((leads) => {
        if (!isCancelled) {
          setMembers(leads || []);
        }
      })
      .catch((error) => {
        console.error("Failed to load members for group deletion:", error);
        if (!isCancelled) {
          setMembers([]);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingMembers(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, group?.id, initialMembers.length]);

  const handleDelete = async () => {
    if (!group) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete(group.id);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!group) return null;

  const totalMembersCount =
    group._count?.leads ?? group.leadIds?.length ?? members.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3F2] flex items-center justify-center shrink-0">
            <Trash2 className="text-[#D92D20]" size={20} />
          </div>
          <div>
            <span className="text-[#1B1B1B] font-inter text-lg font-semibold">
              Delete Group
            </span>
            <p className="text-[#777980] font-inter text-xs">
              Confirm deletion of group and member associations
            </p>
          </div>
        </div>
      }
      size="md"
    >
      <div className="flex flex-col gap-4">
        <p className="text-[#475467] text-sm leading-relaxed">
          Are you sure you want to delete the group <strong>&quot;{group.name}&quot;</strong>? This action cannot be undone.
        </p>

        {/* Warning banner */}
        <div className="p-3.5 rounded-xl bg-[#FFF4F3] border border-[#FECDCA] flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-[#D92D20] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-xs text-[#B42318] leading-relaxed">
            <span className="font-semibold">Notice regarding group members:</span>
            <span>
              Deleting this group will permanently remove it along with all {totalMembersCount} connected member associations.
            </span>
          </div>
        </div>

        {/* Members section */}
        {/* <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[#777980] font-medium px-1">
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              Connected Members ({isLoadingMembers ? "Loading..." : members.length})
            </span>
            {totalMembersCount > members.length && !isLoadingMembers && (
              <span className="text-[11px] text-[#A5A5AB]">
                Showing {members.length} of {totalMembersCount}
              </span>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto rounded-xl border border-[#DFE1E7] bg-[#F8FAFB] p-2 flex flex-col gap-1.5 adm-notes-scroll">
            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-6 gap-2 text-xs text-[#777980]">
                <div className="w-4 h-4 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin" />
                <span>Loading group members...</span>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#777980]">
                {totalMembersCount > 0
                  ? "No member details available (associations will be removed upon deletion)."
                  : "No members currently in this group."}
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white border border-[#E8E8E9] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#EBF5FF] text-[#0098E8] font-semibold flex items-center justify-center text-xs shrink-0">
                      {(member.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-[#1B1B1B] truncate">
                        {member.name}
                      </span>
                      <span className="text-[11px] text-[#777980] truncate">
                        {member.email || member.phone || "No contact info"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {member.vehicle && (
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] text-[#475467] font-medium hidden sm:inline-block">
                        {member.vehicle}
                      </span>
                    )}
                    {member.stage && (
                      <span className="px-2 py-0.5 rounded-md bg-[#F0F8FF] text-[#0098E8] text-[10px] font-medium border border-[#D0E7FF]">
                        {member.stage}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div> */}

        {/* Modal Buttons */}
        <div className="flex gap-3 justify-end pt-3 border-t border-[#E8E8E9]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            loadingText="Deleting..."
            className="px-5 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-white"
          >
            Delete Group
          </Button>
        </div>
      </div>
    </Modal>
  );
}
