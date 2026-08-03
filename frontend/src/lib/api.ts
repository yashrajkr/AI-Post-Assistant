/**
 * Typed fetch wrapper for the AI Post Assistant Express backend.
 *
 * The backend runs on http://localhost:3000 in dev (see ../server.js).
 * In production, set VITE_API_URL to the public backend URL.
 *
 * Auth is stateless: every request carries the current Supabase Auth
 * access token as `Authorization: Bearer <token>`. This works identically
 * whether frontend and backend share an origin (localhost) or not
 * (Vercel frontend -> Render backend) — no cookies involved.
 */
import { supabase } from './supabaseClient';

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  // In dev, Vite proxies "/api" → http://localhost:3000 (see vite.config.ts).
  // In prod, both are usually served from the same origin.
  '';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Friendly per-status messages so the UI doesn't have to repeat itself.
 */
function friendlyMessage(status: number, fallback: string): string {
  if (status === 401) return 'Please login to continue.';
  if (status === 402) return 'You are out of credits. Upgrade your plan to continue.';
  if (status === 403) return 'Your current plan does not allow this action.';
  if (status === 404) return 'That resource was not found.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'Our servers are having trouble. Please try again in a moment.';
  return fallback || 'Request failed. Please try again.';
}

/**
 * Perform a fetch against the backend with credentials (session cookie).
 * Throws ApiError on non-2xx with a friendly message per status code.
 */
export async function api<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  // Build headers. If the body is FormData, let the browser set the boundary.
  const isFormData =
    typeof FormData !== 'undefined' && options?.body instanceof FormData;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  // Try to parse JSON — many error responses are JSON, but some are not.
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = { success: false, message: 'Invalid server response. Please try again.' };
  }

  if (!res.ok) {
    const fallback =
      (data as { message?: string } | null | undefined)?.message ||
      'Request failed. Please try again.';
    throw new ApiError(friendlyMessage(res.status, fallback), res.status, data);
  }

  return data as T;
}

/** GET helper */
export function apiGet<T>(path: string) {
  return api<T>(path, { method: 'GET' });
}

/** POST helper */
export function apiPost<T>(path: string, body?: unknown) {
  return api<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** PUT helper */
export function apiPut<T>(path: string, body?: unknown) {
  return api<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** DELETE helper */
export function apiDelete<T>(path: string) {
  return api<T>(path, { method: 'DELETE' });
}

// ---------- Shared types ----------

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  provider?: string;
  plan: 'free' | 'creator' | 'pro' | 'team' | string;
  credits: number;
  creditsTotal?: number;
  generations?: number;
  brandName?: string;
  tagline?: string;
  niche?: string;
  audience?: string;
  tone?: string;
  aiMode?: string;
  createdAt?: string;
}

export interface UserResponse {
  success: boolean;
  user: User;
}

export interface GenerateResponse {
  success: boolean;
  generation?: {
    id: string;
    platform: string;
    niche?: string;
    titles?: string[];
    captions?: string[];
    hashtags?: string[];
    cta?: string;
    score?: number;
    scores?: { label: string; value: number }[];
    provider?: string;
    content?: string;
    createdAt?: string;
  };
  generations?: Array<GenerateResponse['generation'] & { platform: string }>;
  fallback?: boolean;
  message?: string;
  credits?: number;
}
