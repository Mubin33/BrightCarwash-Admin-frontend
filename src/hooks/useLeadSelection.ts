"use client";

import { useState, useCallback } from "react";

export function useLeadSelection() {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const handleSelectRow = useCallback((id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const handleSelectAll = useCallback((allIds: string[]) => {
		setSelectedIds((prev) =>
			prev.size === allIds.length ? new Set() : new Set(allIds)
		);
	}, []);

	return { selectedIds, handleSelectRow, handleSelectAll, setSelectedIds };
}