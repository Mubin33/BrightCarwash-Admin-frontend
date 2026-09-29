import { APP_CONFIG } from "@/configs/app.config";
import type { LeadDetail, ActivityItem, LeadDetailApiResponse } from "@/types/lead-detail";
import { getAccessToken } from "@/lib/auth-client";

async function fetchFromBackend<T>(url: string, options?: RequestInit): Promise<T> {
	const token = getAccessToken();
	const res = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
		...options,
		headers: {
			Authorization: `Bearer ${token}`,
			...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
			...options?.headers,
		},
	});
	if (!res.ok) throw new Error(`Request failed: ${res.status}`);
	return res.json();
}


export function parseApiNotes(
	rawNotes: unknown[] | undefined,
	fallbackDate?: string,
): { id: string; content: string; author: string; date: string }[] {
	if (!Array.isArray(rawNotes) || rawNotes.length === 0) return [];

	const defaultDate = fallbackDate || new Date().toISOString();
	const result: { id: string; content: string; author: string; date: string }[] = [];
	let buffer: string[] = [];

	for (let i = 0; i < rawNotes.length; i++) {
		const item = rawNotes[i];

		// If it's already an object
		if (item && typeof item === "object" && !Array.isArray(item)) {
			const obj = item as {
				id?: string;
				content?: string;
				author?: string | { first_name?: string; last_name?: string };
				date?: string;
				created_at?: string;
			};
			const authorName = obj.author
				? typeof obj.author === "string"
					? obj.author
					: `${obj.author.first_name || ""} ${obj.author.last_name || ""}`.trim() || "You"
				: "You";

			if (obj.content && typeof obj.content === "string") {
				result.push({
					id: obj.id || `note_${Date.now()}_${i}`,
					content: obj.content,
					author: authorName,
					date: obj.date || obj.created_at || defaultDate,
				});
			}
			continue;
		}

		if (typeof item !== "string") continue;
		const str = item.trim();
		if (!str) continue;

		// 1. Try to parse as single complete JSON string
		try {
			const parsed = JSON.parse(str);
			if (parsed && typeof parsed === "object") {
				if (parsed.content) {
					result.push({
						id: parsed.id || `note_${Date.now()}_${i}`,
						content: String(parsed.content),
						author: parsed.author || "You",
						date: parsed.date || parsed.created_at || defaultDate,
					});
					continue;
				}
			}
		} catch {
			// Not a standalone JSON string
		}

		// 2. Check if this string is part of a fragmented JSON string
		if (str.startsWith("{") || buffer.length > 0) {
			buffer.push(str);
			const joined = buffer.join(",");
			try {
				const parsed = JSON.parse(joined);
				if (parsed && typeof parsed === "object" && parsed.content) {
					result.push({
						id: parsed.id || `note_${Date.now()}_${i}`,
						content: String(parsed.content),
						author: parsed.author || "You",
						date: parsed.date || parsed.created_at || defaultDate,
					});
					buffer = [];
					continue;
				}
			} catch {
				// Keep collecting until ends with }
			}

			if (str.endsWith("}")) {
				const contentMatch = joined.match(/"content"\s*:\s*"([^"]*)"/);
				if (contentMatch) {
					result.push({
						id: `note_${Date.now()}_${i}`,
						content: contentMatch[1],
						author: "You",
						date: defaultDate,
					});
				}
				buffer = [];
			}
			continue;
		}

		// 3. Filter out orphaned JSON fragments like '"author":"You"' or '"date":"..."'
		if (/^"?(author|date|created_at|id)"?\s*:/i.test(str)) {
			continue;
		}

		// 4. Check if it's an orphaned content key like '"content":"456"'
		const contentMatch = str.match(/^"?content"?\s*:\s*"([^"]*)"?$/i);
		if (contentMatch) {
			result.push({
				id: `note_${Date.now()}_${i}`,
				content: contentMatch[1],
				author: "You",
				date: defaultDate,
			});
			continue;
		}

		// 5. Plain text note
		const cleanStr = str.replace(/^"(.*)"$/, "$1").trim();
		if (cleanStr) {
			result.push({
				id: `note_${Date.now()}_${i}`,
				content: cleanStr,
				author: "You",
				date: defaultDate,
			});
		}
	}

	return result;
}

function mapApiToLeadDetail(data: LeadDetailApiResponse): LeadDetail {
	const assignee = data.assigned_to || (data as { assignee?: typeof data.assigned_to }).assignee || null;


	const activityItems: ActivityItem[] = (data.activity_timelines || []).map((item) => {
		let type: ActivityItem['type'] = 'lead';
		const desc = item.description?.toLowerCase() || '';

		if (desc.includes('stage')) {
			type = 'stage';
		} else if (desc.includes('assigned') || desc.includes('unassigned')) {
			type = 'staff';
		}

		const userName = item.user
			? `${item.user.first_name || ''} ${item.user.last_name || ''}`.trim() || 'Unknown'
			: 'System';

		return {
			id: item.id,
			type: type,
			title: item.description || 'Activity',
			subtitle: item.user ? ` by ${userName}` : undefined,
			description: undefined,
			user: userName,
			date: new Date(item.created_at).toLocaleDateString('en-US', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			}),
		};
	});


	const assignmentItems: ActivityItem[] = (data.assignment_history || []).map((item) => {
		const assigneeName = item.assignee
			? `${item.assignee.first_name || ''} ${item.assignee.last_name || ''}`.trim() || 'Unknown'
			: null;
		const assignerName = item.assigner
			? `${item.assigner.first_name || ''} ${item.assigner.last_name || ''}`.trim() || 'Unknown'
			: 'System';

		return {
			id: item.id,
			type: 'staff',
			title: item.assigned_to_id ? 'Lead assigned' : 'Lead unassigned',
			subtitle: item.assigned_to_id ? ` to ${assigneeName}` : undefined,
			description: undefined,
			user: assignerName,
			date: new Date(item.created_at || Date.now()).toLocaleDateString('en-US', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			}),
		};
	});


	const allActivities = [...activityItems, ...assignmentItems];
	allActivities.sort((a, b) => {
		return new Date(b.date).getTime() - new Date(a.date).getTime();
	});

	const mappedAttachments = (() => {
		let list: Array<{ id: string; url: string; fileName: string; fileSize: number; mimeType: string; uploadedAt: string }> = [];

		if (data.attachments_url_paths && data.attachments_url_paths.length > 0) {
			list = (data.attachments_url_paths as Array<{ url?: string; filename?: string; fileName?: string; uploaded_at?: string; uploadedAt?: string; created_at?: string }>).map((a, index) => ({
				id: `att_${index}_${Date.now()}`,
				url: a.url || '',
				fileName: a.filename || a.fileName || a.url?.split('/').pop() || `file_${index}`,
				fileSize: 0,
				mimeType: '',
				uploadedAt: a.uploaded_at || a.uploadedAt || a.created_at || data.created_at || new Date().toISOString(),
			}));
		} else if (data.attachments && data.attachments.length > 0) {
			if (typeof data.attachments[0] === 'string') {
				list = (data.attachments as string[]).map((url, index) => {
					const fileName = url.split('/').pop() || `file_${index}`;
					return {
						id: `att_${index}_${Date.now()}`,
						url: url,
						fileName: fileName,
						fileSize: 0,
						mimeType: '',
						uploadedAt: data.created_at || new Date().toISOString(),
					};
				});
			} else {
				list = (data.attachments as Array<{ id?: string; url?: string; fileName?: string; fileSize?: number; mimeType?: string; uploadedAt?: string; uploaded_at?: string; created_at?: string }>).map((a) => ({
					id: a.id || a.url || `att_${Date.now()}`,
					url: a.url || '',
					fileName: a.fileName || 'file',
					fileSize: a.fileSize || 0,
					mimeType: a.mimeType || '',
					uploadedAt: a.uploaded_at || a.uploadedAt || a.created_at || data.created_at || new Date().toISOString(),
				}));
			}
		}

		list.sort((a, b) => {
			const timeA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
			const timeB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
			return timeB - timeA;
		});

		return list;
	})();

	return {
		id: data.id,
		name: data.name,
		email: data.email,
		phone: data.phone,
		service: data.service,
		vehicle: data.vehicle,
		source: data.source,
		priority: data.priority,
		depositStatus: data.deposit_status,
		stage: data.stage?.name || "New",
		stageId: data.stage_id,
		stageColor: data.stage?.color || "#0098E8",
		assignedToId: assignee?.id || null,
		assignedToName: assignee
			? `${assignee.first_name || ''} ${assignee.last_name || ''}`.trim() || null
			: null,
		avatar: "/images/avatar-placeholder.png",
		notes: parseApiNotes(data.notes, data.created_at),
		attachments: mappedAttachments,
		date: data.created_at?.split("T")[0] || "",
		activities: allActivities,
	};
}

export async function getLeadDetail(id: string): Promise<LeadDetail> {
	const json = await fetchFromBackend<{ success: boolean; data: LeadDetailApiResponse }>(`/admin/lead/${id}`);
	return mapApiToLeadDetail(json.data);
}

export async function getLeadActivities(id: string): Promise<ActivityItem[]> {
	try {
		const lead = await getLeadDetail(id);
		return lead.activities || [];
	} catch (error) {
		console.warn('Failed to fetch activities, returning empty array:', error);
		return [];
	}
}

export async function addLeadNote(id: string, content: string): Promise<void> {
	const currentLead = await getLeadDetail(id);
	const token = getAccessToken();
	const nowIso = new Date().toISOString();

	const newNote = {
		id: `note_${Date.now()}`,
		content: content.trim(),
		author: "You",
		date: nowIso,
		created_at: nowIso,
	};

	const currentNotes = (currentLead.notes || []).map((n) => ({
		id: n.id || `note_${Date.now()}`,
		content: n.content,
		author: n.author || "You",
		date: n.date || nowIso,
		created_at: n.date || nowIso,
	}));
	currentNotes.push(newNote);

	// Serialize each note object into JSON string (pure application/json, never FormData)
	const notesPayload = currentNotes.map((note) => JSON.stringify(note));

	const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/lead/${id}`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({ notes: notesPayload }),
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({ message: "Update failed" }));
		throw new Error(error.message || "Failed to add note");
	}
}

export async function deleteLeadNote(leadId: string, noteIdentifier: string): Promise<void> {
	const lead = await getLeadDetail(leadId);
	const token = getAccessToken();

	const remainingNotes = (lead.notes || [])
		.filter((n) => n.id !== noteIdentifier && n.content !== noteIdentifier)
		.map((n) => ({
			id: n.id,
			content: n.content,
			author: n.author || "You",
			date: n.date || new Date().toISOString(),
			created_at: n.date || new Date().toISOString(),
		}));

	const notesPayload = remainingNotes.map((note) => JSON.stringify(note));

	const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/lead/${leadId}`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({ notes: notesPayload }),
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({ message: "Failed to delete note" }));
		throw new Error(error.message || "Failed to delete note");
	}
}

export async function assignLeadToMember(
	leadId: string,
	assignedToId: string | null
): Promise<void> {
	const token = getAccessToken();

	if (assignedToId === null) {
		const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/lead/${leadId}/unassign`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res.ok) {
			const error = await res.json().catch(() => ({ message: "Unassignment failed" }));
			throw new Error(error.message || "Failed to unassign lead");
		}
		return;
	}

	const payload = {
		assigned_to_id: assignedToId,
		assignment_source: "Admin Panel",
	};

	const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/lead/${leadId}/assign`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({ message: "Assignment failed" }));
		throw new Error(error.message || "Failed to assign lead");
	}
}

export async function updateLeadDetails(
	leadId: string,
	data: {
		name?: string;
		email?: string;
		phone?: string;
		service?: string;
		vehicle?: string;
		source?: string;
		priority?: string;
		deposit_status?: string;
		notes?: (string | { id?: string; content: string; date?: string; created_at?: string; author?: string })[];
		stage_name?: string;
		files?: File[];
	}
): Promise<LeadDetail> {
	const token = getAccessToken();
	const formData = new FormData();

	// Text fields
	if (data.name) formData.append('name', data.name);
	if (data.email) formData.append('email', data.email);
	if (data.phone) formData.append('phone', data.phone);
	if (data.service) formData.append('service', data.service);
	if (data.vehicle) formData.append('vehicle', data.vehicle);
	if (data.source) formData.append('source', data.source);
	if (data.priority) formData.append('priority', data.priority);
	if (data.deposit_status) formData.append('deposit_status', data.deposit_status);
	if (data.notes && data.notes.length) {
		data.notes.forEach((note) => {
			const val = typeof note === 'string' ? note : JSON.stringify(note);
			formData.append('notes', val);
		});
	}
	if (data.stage_name) formData.append('stage_name', data.stage_name);


	if (data.files && data.files.length > 0) {
		data.files.forEach((file) => {
			formData.append('files', file);
		});
	}

	const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/lead/${leadId}`, {
		method: 'PATCH',
		headers: { Authorization: `Bearer ${token}` },
		body: formData,
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({ message: 'Update failed' }));
		throw new Error(error.message || 'Failed to update lead');
	}

	const updated = await getLeadDetail(leadId);
	return updated;
}