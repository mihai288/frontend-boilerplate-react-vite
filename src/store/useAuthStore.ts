import { create } from 'zustand';
import type { AuthSession, AuthUser } from '@services/auth';

const AUTH_STORAGE_KEY = 'auth-session';

interface StoredAuthSession {
  access_token: string;
  user: AuthUser;
}

function readStoredSession(): StoredAuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as StoredAuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

interface AuthStore {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

const initialSession = readStoredSession();

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: initialSession?.access_token ?? null,
  user: initialSession?.user ?? null,
  isAuthenticated: Boolean(initialSession),
  setSession: (session) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    set({ accessToken: session.access_token, user: session.user, isAuthenticated: true });
  },
  clearSession: () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
}));
