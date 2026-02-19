const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const ACCESS_TOKEN_KEY = 'meditrack_access_token';
const REFRESH_TOKEN_KEY = 'meditrack_refresh_token';
const USER_KEY = 'meditrack_user';

let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY);

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  pharmacyName: string;
}

export const authStorage = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: (): StoredUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },
  setSession: (session: { accessToken: string; refreshToken: string; user: StoredUser }) => {
    accessToken = session.accessToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  },
  setAccessToken: (token: string) => {
    accessToken = token;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear: () => {
    accessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    authStorage.clear();
    return false;
  }

  const data = await response.json();
  const nextAccessToken = data?.accessToken as string | undefined;
  const nextRefreshToken = data?.refreshToken as string | undefined;

  if (!nextAccessToken || !nextRefreshToken) {
    authStorage.clear();
    return false;
  }

  authStorage.setAccessToken(nextAccessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
  return true;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  allowRefresh = true,
): Promise<T> => {
  const headers = new Headers(options.headers || {});
  const token = authStorage.getAccessToken();

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && allowRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, options, false);
    }
  }

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const error = await response.json();
      const issues = error?.details?.issues as Array<{ path?: string; message?: string }> | undefined;
      if (issues?.length) {
        const formatted = issues
          .map((issue) => `${issue.path || 'request'}: ${issue.message || 'Invalid value'}`)
          .join(', ');
        message = formatted;
      } else {
        message = error?.message || message;
      }
    } catch {
      // noop
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
};