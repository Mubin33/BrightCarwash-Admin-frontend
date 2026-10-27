import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiFetchModule from '@/lib/api-fetch';
import { addLeadNote, deleteLeadNote, getSessionAuthor } from './lead-detail.service';
import { store } from '@/lib/store';
import { setUser, clearAuth } from '@/store/slices/authSlice';

describe('AU9 (P1) / A-11 & N-18: Lead Notes Append, Session Author & Strict ID Deletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.dispatch(clearAuth());
  });

  it('two staff adding notes at once keep both (server-side append)', async () => {
    const postCalls: { url: string; body: unknown }[] = [];

    vi.spyOn(apiFetchModule, 'apiFetch').mockImplementation(async (url, init) => {
      const urlStr = url.toString();
      if (urlStr.includes('/notes') && init?.method === 'POST') {
        postCalls.push({
          url: urlStr,
          body: JSON.parse(init.body as string),
        });
        return new Response(JSON.stringify({ success: true, message: 'Note created' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    // Simulate Staff A and Staff B concurrently adding notes to the same lead
    await Promise.all([
      addLeadNote('lead-123', 'Note from Staff A', 'Staff A'),
      addLeadNote('lead-123', 'Note from Staff B', 'Staff B'),
    ]);

    // Both calls must issue independent atomic appends without client read-modify-write overwrite
    expect(postCalls).toHaveLength(2);
    expect(postCalls[0].url).toContain('/admin/lead/lead-123/notes');
    expect(postCalls[1].url).toContain('/admin/lead/lead-123/notes');

    const contents = postCalls.map((c) => (c.body as { content: string }).content);
    expect(contents).toContain('Note from Staff A');
    expect(contents).toContain('Note from Staff B');

    const authors = postCalls.map((c) => (c.body as { author: string }).author);
    expect(authors).toContain('Staff A');
    expect(authors).toContain('Staff B');
  });

  it('note author is dynamically attributed from active session instead of hardcoded "You"', async () => {
    // Set active user in Redux store
    store.dispatch(
      setUser({
        id: 'usr_789',
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex.morgan@brightside.com',
        role: 'sales_agent',
        avatar: null,
        permissions: ['lead:read', 'lead:update'],
      })
    );

    expect(getSessionAuthor()).toBe('Alex Morgan');

    let capturedPayload: { content: string; author: string } | null = null;

    vi.spyOn(apiFetchModule, 'apiFetch').mockImplementation(async (url, init) => {
      const urlStr = url.toString();
      if (urlStr.includes('/notes') && init?.method === 'POST') {
        capturedPayload = JSON.parse(init.body as string);
        return new Response(JSON.stringify({ success: true }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });

    await addLeadNote('lead-123', 'Customer prefers morning service');

    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload!.author).toBe('Alex Morgan');
    expect(capturedPayload!.author).not.toBe('You');
    expect(capturedPayload!.content).toBe('Customer prefers morning service');
  });

  it('deleting one of two identical notes removes only the note with that ID', async () => {
    let deletedUrl = '';

    vi.spyOn(apiFetchModule, 'apiFetch').mockImplementation(async (url, init) => {
      const urlStr = url.toString();
      if (init?.method === 'DELETE') {
        deletedUrl = urlStr;
        return new Response(JSON.stringify({ success: true, message: 'Note deleted' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });

    // Delete note-1 specifically
    await deleteLeadNote('lead-123', 'note-uuid-1');

    // Must delete strictly by ID via dedicated child endpoint
    expect(deletedUrl).toBe('/admin/lead/lead-123/notes/note-uuid-1');
  });

  it('fallback delete strictly preserves duplicate-text notes when backend child resource returns 404', async () => {
    // Lead with two notes having identical content but different IDs
    const mockLeadApiResponse = {
      success: true,
      data: {
        id: 'lead-123',
        notes: [
          JSON.stringify({ id: 'note-uuid-1', content: 'Follow up needed', author: 'Staff 1', date: '2026-10-18T10:00:00Z' }),
          JSON.stringify({ id: 'note-uuid-2', content: 'Follow up needed', author: 'Staff 2', date: '2026-10-18T11:00:00Z' }),
        ],
      },
    };

    vi.spyOn(apiFetchModule, 'fetchFromBackend').mockImplementation(async (url) => {
      if (url.includes('/admin/lead/lead-123')) {
        return mockLeadApiResponse as never;
      }
      return { success: true } as never;
    });

    let patchedNotesPayload: { id: string; content: string }[] = [];

    vi.spyOn(apiFetchModule, 'apiFetch').mockImplementation(async (url, init) => {
      // First try DELETE /notes/:id -> simulate 404 on backend
      if (init?.method === 'DELETE') {
        return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
      }
      // PATCH fallback
      if (init?.method === 'PATCH') {
        const body = JSON.parse(init.body as string);
        patchedNotesPayload = body.notes.map((n: string) => JSON.parse(n));
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });

    // Delete note-uuid-1
    await deleteLeadNote('lead-123', 'note-uuid-1');

    // Only note-uuid-1 should be removed; note-uuid-2 with identical content MUST be preserved
    expect(patchedNotesPayload).toHaveLength(1);
    expect(patchedNotesPayload[0].id).toBe('note-uuid-2');
    expect(patchedNotesPayload[0].content).toBe('Follow up needed');
  });

  it('fallback add note generates unique ID and uses session author when backend returns 404', async () => {
    store.dispatch(
      setUser({
        id: 'usr_456',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena@brightside.com',
        role: 'manager',
        avatar: null,
        permissions: ['lead:read', 'lead:update'],
      })
    );

    const mockLeadApiResponse = {
      success: true,
      data: {
        id: 'lead-123',
        notes: [
          JSON.stringify({ id: 'note-uuid-1', content: 'Existing note', author: 'Staff 1', date: '2026-10-18T10:00:00Z' }),
        ],
      },
    };

    vi.spyOn(apiFetchModule, 'fetchFromBackend').mockResolvedValue(mockLeadApiResponse as never);

    let patchedPayload: { notes: string[] } | null = null;

    vi.spyOn(apiFetchModule, 'apiFetch').mockImplementation(async (url, init) => {
      // Simulate 404 on POST /notes
      if (init?.method === 'POST') {
        return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
      }
      // PATCH fallback
      if (init?.method === 'PATCH') {
        patchedPayload = JSON.parse(init.body as string);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });

    await addLeadNote('lead-123', 'Customer booked wash appointment');

    expect(patchedPayload).not.toBeNull();
    const parsedNotes = patchedPayload!.notes.map((n) => JSON.parse(n));
    expect(parsedNotes).toHaveLength(2);
    expect(parsedNotes[1].content).toBe('Customer booked wash appointment');
    expect(parsedNotes[1].author).toBe('Elena Rostova');
    expect(parsedNotes[1].author).not.toBe('You');
    expect(parsedNotes[1].id).toBeDefined();
    expect(parsedNotes[1].id).not.toBe('note-uuid-1');
  });
  it('fallback delete correctly deletes legacy notes without stored UUIDs', async () => {
    const mockLeadApiResponse = {
      success: true,
      data: {
        id: 'lead-123',
        notes: [
          JSON.stringify({ content: 'Legacy note 1', author: 'Staff 1', date: '2026-10-18T10:00:00Z' }),
          JSON.stringify({ content: 'Legacy note 2', author: 'Staff 2', date: '2026-10-18T11:00:00Z' }),
        ],
      },
    };

    vi.spyOn(apiFetchModule, 'fetchFromBackend').mockImplementation(async (url) => {
      if (url.includes('/admin/lead/lead-123')) {
        return mockLeadApiResponse as never;
      }
      return { success: true } as never;
    });

    let patchedNotesPayload: { id: string; content: string }[] = [];

    vi.spyOn(apiFetchModule, 'apiFetch').mockImplementation(async (url, init) => {
      if (init?.method === 'DELETE') {
        return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
      }
      if (init?.method === 'PATCH') {
        const body = JSON.parse(init.body as string);
        patchedNotesPayload = body.notes.map((n: string) => JSON.parse(n));
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });

    await deleteLeadNote('lead-123', 'legacy_note_0');

    expect(patchedNotesPayload).toHaveLength(1);
    expect(patchedNotesPayload[0].content).toBe('Legacy note 2');
  });
});
