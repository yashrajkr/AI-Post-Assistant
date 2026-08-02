/**
 * API client for AI Post Assistant backend.
 * Uses Bearer token auth (API key generated in web dashboard).
 */

import { getApiKey, getBackendUrl } from './storage';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new ApiError('No API key set. Open extension options to add one.', 401, 'NO_API_KEY');
  }

  const baseUrl = await getBackendUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...options?.headers,
    },
  });

  const data = await res.json().catch(() => ({
    success: false,
    message: 'Invalid server response.',
  }));

  if (!res.ok) {
    let msg = (data as { message?: string })?.message || 'Request failed.';
    if (res.status === 401) {
      msg = 'Invalid API key. Generate a new one in the web dashboard.';
    } else if (res.status === 402) {
      msg = 'You are out of credits. Upgrade your plan.';
    } else if (res.status === 429) {
      msg = 'Too many requests. Please wait a moment.';
    } else if (res.status >= 500) {
      msg = 'Our servers are having trouble. Try again later.';
    }
    throw new ApiError(msg, res.status);
  }

  return data as T;
}

// ---- Typed API methods ----

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  credits: number;
}

export interface GenerateResult {
  titles: string[];
  captions: string[];
  hashtags: string[];
  keywords: string[];
  description: string;
  cta: string;
  thumbnail: string[];
  postingTip: string;
  improvementSuggestion: string;
  whyThisWorks: string;
  score?: {
    hook: number;
    seo: number;
    cta: number;
    readability: number;
    virality: number;
    emotion: number;
    total: number;
    suggestions: { dimension: string; score: number; suggestion: string }[];
  } | null;
}

export interface GenerateResponse {
  success: boolean;
  generation: {
    id: string;
    createdAt: string;
    input: {
      content: string;
      platform: string;
      niche: string;
      language: string;
      goal: string;
      tone: string;
      template: string;
    };
    result: GenerateResult;
    provider: string;
  };
  user: User;
  provider: string;
  usedFallback?: boolean;
}

export async function getMe(): Promise<User | null> {
  try {
    const data = await api<{ success: boolean; user: User }>('/api/me');
    return data.user;
  } catch (err) {
    if (err instanceof ApiError && err.code === 'NO_API_KEY') return null;
    throw err;
  }
}

export async function generate(input: {
  content: string;
  platform: string;
  niche: string;
  language: string;
  goal: string;
  tone: string;
  template?: string;
  audience?: string;
  location?: string;
}): Promise<GenerateResponse> {
  return api<GenerateResponse>('/api/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function analyzeImage(imageBase64: string, options: {
  platform?: string;
  niche?: string;
  tone?: string;
} = {}): Promise<{
  success: boolean;
  analysis: {
    id: string;
    createdAt: string;
    result: {
      caption: string;
      hook: string;
      hashtags: string[];
      altText: string;
      cta: string;
      keywords: string[];
    };
    provider: string;
  };
  user: User;
}> {
  return api('/api/analyze-image', {
    method: 'POST',
    body: JSON.stringify({ imageBase64, ...options }),
  });
}
