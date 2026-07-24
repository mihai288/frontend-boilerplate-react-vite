const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api';
const AUTH_STORAGE_KEY = 'auth-session';

function handleUnauthorized() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);

  if (!window.location.pathname.includes('/login')) {
    window.location.replace('/login');
  }
}

function readAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as { access_token?: string };
    return parsedSession.access_token ?? null;
  } catch {
    return null;
  }
}

function readAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem('auth-session');

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as { access_token?: string };
    return session.access_token ?? null;
  } catch {
    window.localStorage.removeItem('auth-session');
    return null;
  }
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = readAccessToken();
  const token = readAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }

    const errorBody = body as { message?: string; error?: string } | string;
    const message =
      typeof errorBody === 'string'
        ? errorBody
        : (errorBody.message ?? errorBody.error ?? 'Request failed');

    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return body as T;
}
