'use client';

import { useState, useCallback } from 'react';

export function useLeadFilters() {
	const [searchQuery, setSearchQuery] = useState('');
	const [sourceFilter, setSourceFilter] = useState('');
	const [depositFilter, setDepositFilter] = useState('');

	const resetFilters = useCallback(() => {
		setSearchQuery('');
		setSourceFilter('');
		setDepositFilter('');
	}, []);

	return {
		searchQuery,
		setSearchQuery,
		sourceFilter,
		setSourceFilter,
		depositFilter,
		setDepositFilter,
		resetFilters,
	};
}