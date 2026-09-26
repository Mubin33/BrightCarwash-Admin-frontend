"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import type { Permission, TeamRole } from "@/types/team";
import { memo, useEffect, useMemo, useRef, useState } from "react";

interface EditPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: TeamRole | null;
  allPermissions: Permission[];
  selectedPermissions: string[];
  onSave: (roleId: string, permissions: string[]) => void;
}

function isSuperAdmin(roleName: string): boolean {
  const normalized = roleName.toLowerCase().replace(/[\s_-]/g, "");
  return normalized === "superadmin" || normalized === "superuser";
}

export const EditPermissionsModal = memo(function EditPermissionsModal({
  isOpen,
  onClose,
  role,
  allPermissions,
  selectedPermissions,
  onSave,
}: EditPermissionsModalProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(selectedPermissions),
  );

  const prevPermissionsRef = useRef<string[]>(selectedPermissions);

  const canUpdate = usePermission(PERMISSIONS.role.update);
  const isLocked = role ? isSuperAdmin(role.name) : false;
  const isReadOnly = isLocked || !canUpdate;

  const isReadPermission = (permission: Permission) =>
    permission.name.endsWith(":read");

  const normalizePermissions = (permissions: string[]) => {
    const next = new Set(permissions);

    for (const permission of allPermissions) {
      if (isReadPermission(permission)) continue;
      if (!next.has(permission.id)) continue;

      const readPermission = allPermissions.find(
        (p) => p.module === permission.module && isReadPermission(p),
      );

      if (readPermission) {
        next.add(readPermission.id);
      }
    }

    return next;
  };

  useEffect(() => {
    const prev = prevPermissionsRef.current;
    const next = selectedPermissions;

    if (prev.length !== next.length || !prev.every((id) => next.includes(id))) {
      setSelected(normalizePermissions(next));
      prevPermissionsRef.current = next;
    }
  }, [selectedPermissions, allPermissions]);

  const grouped = useMemo(() => {
    const map: Record<string, Permission[]> = {};

    for (const permission of allPermissions) {
      if (!map[permission.module]) {
        map[permission.module] = [];
      }

      map[permission.module].push(permission);
    }

    return map;
  }, [allPermissions]);

  const allIds = useMemo(
    () => allPermissions.map((permission) => permission.id),
    [allPermissions],
  );

  const isAllSelected =
    allIds.length > 0 && allIds.every((id) => selected.has(id));

  const toggleAll = () => {
    if (isReadOnly) return;

    setSelected(isAllSelected ? new Set() : new Set(allIds));
  };

  const toggleModule = (module: string) => {
    if (isReadOnly) return;

    const permissions = grouped[module] ?? [];
    const ids = permissions.map((permission) => permission.id);

    const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));

    setSelected((prev) => {
      const next = new Set(prev);

      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }

      return next;
    });
  };

  const togglePermission = (id: string) => {
    if (isReadOnly) return;

    setSelected((prev) => {
      const next = new Set(prev);

      const permission = allPermissions.find((p) => p.id === id);

      if (!permission) return prev;

      const isRead = isReadPermission(permission);

      if (isRead) {
        const hasOtherPermission = allPermissions.some(
          (p) =>
            p.module === permission.module &&
            p.id !== permission.id &&
            !isReadPermission(p) &&
            next.has(p.id),
        );

        if (next.has(id) && hasOtherPermission) {
          return prev;
        }

        next.has(id) ? next.delete(id) : next.add(id);

        return next;
      }

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);

        const readPermission = allPermissions.find(
          (p) => p.module === permission.module && isReadPermission(p),
        );

        if (readPermission) {
          next.add(readPermission.id);
        }
      }

      return next;
    });
  };

  const handleSave = () => {
    if (!role || isReadOnly) return;

    onSave(role.id, Array.from(selected));
    onClose();
  };

  const formatPermissionName = (name: string) => {
    return name
      .split(":")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(":");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Permissions — ${role?.name || ""}${
        isReadOnly ? (isLocked ? " (Protected Role)" : " (View Only)") : ""
      }`}
      size="lg"
      bodyClassName="py-3"
    >
      <div className="flex flex-col gap-4">
        <div className="w-full h-px bg-[#DFE1E7]" />

        <label
          className={`flex items-center gap-2.5 ${
            isReadOnly ? "cursor-default opacity-70" : "cursor-pointer"
          }`}
        >
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleAll}
            disabled={isReadOnly}
            className="w-4 h-4 rounded accent-[#0098E8]"
          />

          <span className="text-sm font-medium text-[#1B1B1B]">
            Select All Permissions
          </span>
        </label>

        <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto">
          {Object.entries(grouped).map(([module, perms]) => {
            const moduleIds = perms.map((p) => p.id);

            const allModSelected =
              moduleIds.length > 0 && moduleIds.every((id) => selected.has(id));

            const someModSelected = moduleIds.some((id) => selected.has(id));

            return (
              <div key={module}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#777980]">
                    {module}
                  </h3>

                  <label
                    className={`flex items-center gap-1.5 text-xs text-[#777980] ${
                      isReadOnly
                        ? "cursor-default opacity-70"
                        : "cursor-pointer hover:text-[#1B1B1B]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allModSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = someModSelected && !allModSelected;
                        }
                      }}
                      onChange={() => toggleModule(module)}
                      disabled={isReadOnly}
                      className="w-3.5 h-3.5 rounded accent-[#0098E8]"
                    />
                    Module All
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {perms.map((perm) => {
                    const isRead = isReadPermission(perm);

                    const hasOtherPermission = perms.some(
                      (p) =>
                        p.id !== perm.id &&
                        !isReadPermission(p) &&
                        selected.has(p.id),
                    );

                    const readDisabled = isRead && hasOtherPermission;

                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors text-sm ${
                          isReadOnly
                            ? "cursor-default opacity-75"
                            : readDisabled
                              ? "cursor-not-allowed opacity-70"
                              : "cursor-pointer"
                        } ${
                          selected.has(perm.id)
                            ? "border-[#0098E8] bg-[#EBF5FF]"
                            : `border-[#DFE1E7] bg-[#F8FAFB] ${
                                !isReadOnly && !readDisabled
                                  ? "hover:border-[#B0B3BC]"
                                  : ""
                              }`
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          disabled={isReadOnly || readDisabled}
                          className="w-3.5 h-3.5 rounded accent-[#0098E8] shrink-0"
                        />

                        <span className="text-[#1B1B1B] text-xs leading-tight">
                          {formatPermissionName(perm.name)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-[#E8E8E9]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6 w-auto!"
          >
            {canUpdate && !isLocked ? "Cancel" : "Close"}
          </Button>

          {canUpdate && (
            <Button
              onClick={handleSave}
              disabled={isLocked}
              className="px-6 w-auto!"
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
});
