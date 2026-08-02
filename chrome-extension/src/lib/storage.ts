/**
 * Storage wrapper for chrome.storage.sync
 * Syncs across user's devices. Stores API key + preferences.
 */

const STORAGE_KEYS = {
  API_KEY: 'apiKey',
  BACKEND_URL: 'backendUrl',
  DEFAULT_PLATFORM: 'defaultPlatform',
  DEFAULT_TONE: 'defaultTone',
} as const;

export async function getApiKey(): Promise<string | null> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.API_KEY);
  return result[STORAGE_KEYS.API_KEY] || null;
}

export async function setApiKey(key: string): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEYS.API_KEY]: key });
}

export async function getBackendUrl(): Promise<string> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.BACKEND_URL);
  return result[STORAGE_KEYS.BACKEND_URL] || 'https://ai-post-assistant-backend.onrender.com';
}

export async function setBackendUrl(url: string): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEYS.BACKEND_URL]: url });
}

export async function getDefaultPlatform(): Promise<string> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.DEFAULT_PLATFORM);
  return result[STORAGE_KEYS.DEFAULT_PLATFORM] || 'Instagram';
}

export async function setDefaultPlatform(platform: string): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEYS.DEFAULT_PLATFORM]: platform });
}

export async function clearAll(): Promise<void> {
  await chrome.storage.sync.remove(Object.values(STORAGE_KEYS));
}
