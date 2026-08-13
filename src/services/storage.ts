import { ProjectItem } from '../types';

export interface HistoryItem {
  id: string;
  toolType: string;
  title: string;
  prompt: string;
  content: any;
  isFavorite?: boolean;
  createdAt: string;
}

export interface UserPreferences {
  onboarded: boolean;
  theme: 'dark' | 'light' | 'system';
  defaultPlatform: string;
  defaultLanguage: string;
  creatorNiche: string;
  creatorGoal: string;
}

const STORAGE_KEYS = {
  PREFERENCES: 'ranjay_ai_preferences',
  HISTORY: 'ranjay_ai_history',
  FAVORITES: 'ranjay_ai_favorites',
  PROJECTS_LOCAL: 'ranjay_ai_local_projects',
};

// PREFERENCES
export const getPreferences = (): UserPreferences => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading preferences:', e);
  }
  return {
    onboarded: false,
    theme: 'dark',
    defaultPlatform: 'YouTube Shorts',
    defaultLanguage: 'Hinglish',
    creatorNiche: 'General Content',
    creatorGoal: 'Grow Audience & Monetize',
  };
};

export const savePreferences = (prefs: Partial<UserPreferences>): UserPreferences => {
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving preferences:', e);
  }
  return updated;
};

// GENERATION HISTORY
export const getHistory = (): HistoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading history:', e);
  }
  return [];
};

export const addHistoryItem = (item: {
  toolType: string;
  title: string;
  prompt: string;
  content: any;
}): HistoryItem => {
  const history = getHistory();
  const newItem: HistoryItem = {
    id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    toolType: item.toolType,
    title: item.title,
    prompt: item.prompt,
    content: item.content,
    isFavorite: false,
    createdAt: new Date().toISOString(),
  };
  const updated = [newItem, ...history].slice(0, 100); // keep last 100
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving history:', e);
  }
  return newItem;
};

export const toggleFavoriteHistory = (id: string): HistoryItem[] => {
  const history = getHistory();
  const updated = history.map((item) =>
    item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
  );
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating history favorite:', e);
  }
  return updated;
};

export const deleteHistoryItem = (id: string): HistoryItem[] => {
  const history = getHistory();
  const updated = history.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting history item:', e);
  }
  return updated;
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (e) {
    console.error('Error clearing history:', e);
  }
};

// FAVORITES
export const getFavoriteProjectIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading favorites:', e);
  }
  return [];
};

export const toggleFavoriteProject = (projectId: string): boolean => {
  const favs = getFavoriteProjectIds();
  const exists = favs.includes(projectId);
  const updated = exists ? favs.filter((id) => id !== projectId) : [...favs, projectId];
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving favorites:', e);
  }
  return !exists;
};
