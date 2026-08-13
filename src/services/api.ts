import {
  ScriptPackage,
  ContentIdea,
  ThumbnailConcept,
  ShortsPackage,
  EditingPlan,
  TitleOption,
  SeoPackage,
  CompleteVideoPackage,
  ProjectItem,
  FactCheckResult,
} from '../types';

async function fetchApi<T>(endpoint: string, body?: any, method = 'POST'): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(endpoint, options);
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || `API request failed: ${res.statusText}`);
  }
  return data;
}

export async function factCheckApi(params: {
  text: string;
  factCheckMode?: boolean;
}): Promise<FactCheckResult> {
  const res = await fetchApi<{ success: boolean; result: FactCheckResult }>('/api/fact-check', params);
  return res.result;
}

export async function generateScriptApi(params: {
  topic: string;
  platform?: string;
  duration?: string;
  language?: string;
  style?: string;
  factCheckMode?: boolean;
}): Promise<ScriptPackage> {
  const res = await fetchApi<{ success: boolean; script: ScriptPackage }>('/api/generate-script', params);
  return res.script;
}

export async function generateIdeasApi(params: {
  niche: string;
  language?: string;
}): Promise<ContentIdea[]> {
  const res = await fetchApi<{ success: boolean; ideas: ContentIdea[] }>('/api/generate-ideas', params);
  return res.ideas;
}

export async function analyzeThumbnailApi(params: {
  imageBase64?: string;
  mimeType?: string;
  description?: string;
  format?: string;
}): Promise<ThumbnailConcept> {
  const res = await fetchApi<{ success: boolean; concept: ThumbnailConcept }>('/api/analyze-thumbnail', params);
  return res.concept;
}

export async function generateThumbnailImageApi(params: {
  prompt: string;
  aspectRatio?: string;
}): Promise<string> {
  const res = await fetchApi<{ success: boolean; imageUrl: string }>('/api/generate-image', params);
  return res.imageUrl;
}

export async function generateShortsApi(params: {
  topic: string;
  duration?: string;
  language?: string;
  style?: string;
  factCheckMode?: boolean;
}): Promise<ShortsPackage> {
  const res = await fetchApi<{ success: boolean; shortsPackage: ShortsPackage }>('/api/generate-shorts', params);
  return res.shortsPackage;
}

export async function generateEditingPlanApi(params: {
  footageDescription: string;
  videoType?: string;
}): Promise<EditingPlan> {
  const res = await fetchApi<{ success: boolean; editingPlan: EditingPlan }>('/api/generate-editing-plan', params);
  return res.editingPlan;
}

export async function generateTitlesApi(params: {
  topic: string;
  language?: string;
}): Promise<TitleOption[]> {
  const res = await fetchApi<{ success: boolean; titles: TitleOption[] }>('/api/generate-titles', params);
  return res.titles;
}

export async function generateSeoApi(params: {
  topic: string;
  details?: string;
  language?: string;
}): Promise<SeoPackage> {
  const res = await fetchApi<{ success: boolean; seo: SeoPackage }>('/api/generate-seo', params);
  return res.seo;
}

export async function generateCompleteVideoApi(params: {
  topic: string;
  platform?: string;
  duration?: string;
  language?: string;
  factCheckMode?: boolean;
}): Promise<CompleteVideoPackage> {
  const res = await fetchApi<{ success: boolean; completePackage: CompleteVideoPackage }>(
    '/api/generate-complete-video',
    params
  );
  return res.completePackage;
}

export async function creatorChatApi(params: {
  messages: { role: 'user' | 'assistant'; text: string }[];
  userPrompt?: string;
  language?: string;
}): Promise<string> {
  const res = await fetchApi<{ success: boolean; reply: string }>('/api/creator-chat', params);
  return res.reply;
}

export async function generateTtsApi(params: {
  text: string;
  voice?: string;
}): Promise<string> {
  const res = await fetchApi<{ success: boolean; base64Audio: string }>('/api/generate-tts', params);
  return res.base64Audio;
}

export async function getProjectsApi(): Promise<ProjectItem[]> {
  const res = await fetchApi<{ success: boolean; projects: ProjectItem[] }>('/api/projects', undefined, 'GET');
  return res.projects;
}

export async function saveProjectApi(projectData: {
  title: string;
  type: string;
  topic?: string;
  platform?: string;
  language?: string;
  content: any;
}): Promise<ProjectItem> {
  const res = await fetchApi<{ success: boolean; project: ProjectItem }>('/api/projects', projectData);
  return res.project;
}

export async function deleteProjectApi(id: string): Promise<void> {
  await fetchApi<{ success: boolean }>(`/api/projects/${id}`, undefined, 'DELETE');
}
