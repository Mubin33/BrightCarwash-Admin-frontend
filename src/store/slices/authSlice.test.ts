import { describe, it, expect, vi, beforeEach } from 'vitest';
import authReducer, { setUser, setLoading, clearAuth, initAuth } from './authSlice';
import * as authClient from '@/lib/auth-client';
import type { User } from '@/types/auth';

vi.mock('@/lib/auth-client', () => ({
  isAuthenticated: vi.fn(),
}));

describe('authSlice (BUG-015 SSR Hydration & Auth State)', () => {
  const mockUser: User = {
    id: 'user_123',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@brightside.com',
    avatar: null,
    role: 'super_admin',
    permissions: ['dashboard:view'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has hydration-safe initial state (isAuthenticated: false, isLoading: true)', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('initAuth sets isLoading: false and isAuthenticated: false when unauthenticated', () => {
    vi.mocked(authClient.isAuthenticated).mockReturnValue(false);
    const initial = { user: null, isAuthenticated: false, isLoading: true };
    const next = authReducer(initial, initAuth());

    expect(next.isAuthenticated).toBe(false);
    expect(next.isLoading).toBe(false);
    expect(next.user).toBeNull();
  });

  it('initAuth retains isLoading: true while waiting for user profile if token exists', () => {
    vi.mocked(authClient.isAuthenticated).mockReturnValue(true);
    const initial = { user: null, isAuthenticated: false, isLoading: true };
    const next = authReducer(initial, initAuth());

    expect(next.isAuthenticated).toBe(true);
    expect(next.isLoading).toBe(true);
  });

  it('setUser sets user, updates isAuthenticated, and terminates loading state', () => {
    vi.mocked(authClient.isAuthenticated).mockReturnValue(true);
    const initial = { user: null, isAuthenticated: true, isLoading: true };
    const next = authReducer(initial, setUser(mockUser));

    expect(next.user).toEqual(mockUser);
    expect(next.isAuthenticated).toBe(true);
    expect(next.isLoading).toBe(false);
  });

  it('clearAuth resets user, isAuthenticated, and isLoading cleanly', () => {
    const initial = { user: mockUser, isAuthenticated: true, isLoading: false };
    const next = authReducer(initial, clearAuth());

    expect(next.user).toBeNull();
    expect(next.isAuthenticated).toBe(false);
    expect(next.isLoading).toBe(false);
  });

  it('setLoading updates isLoading state', () => {
    const initial = { user: null, isAuthenticated: false, isLoading: false };
    const next = authReducer(initial, setLoading(true));
    expect(next.isLoading).toBe(true);
  });
});
