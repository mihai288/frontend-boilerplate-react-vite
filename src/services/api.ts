const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api';
const AUTH_STORAGE_KEY = 'auth-session';

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
    const errorBody = body as { message?: string; error?: string } | string;
    const message =
      typeof errorBody === 'string'
        ? errorBody
        : (errorBody.message ?? errorBody.error ?? 'Request failed');

    throw new Error(message);
  }

  return body as T;
}
