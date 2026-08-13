export type PlatformType = 'YouTube' | 'YouTube Shorts' | 'Instagram Reels' | 'Facebook Reels';
export type LanguageType = 'Hinglish' | 'Hindi' | 'English' | 'Bhojpuri';
export type DurationType = '15 sec' | '30 sec' | '60 sec' | '3 min' | '5 min' | '10 min' | 'Custom';
export type ScriptStyleType = 'Informative' | 'Emotional' | 'Funny' | 'Suspense' | 'Motivational' | 'Storytelling' | 'News' | 'Documentary' | 'Cinematic';

export interface SceneItem {
  time?: string;
  visual?: string;
  voiceover?: string;
  onScreenText?: string;
  overlayText?: string;
  audio?: string;
}

export interface ScriptPackage {
  title: string;
  hook: string;
  introduction: string;
  script: string;
  sceneBreakdown: SceneItem[];
  voiceoverText: string;
  onScreenText: string;
  visualSuggestions: string;
  brollSuggestions: string;
  ending: string;
  cta: string;
}

export interface ContentIdea {
  id: number;
  title: string;
  category: 'Trending-style' | 'Educational' | 'Entertainment' | 'Suspense' | 'Emotional' | 'Facts' | 'Gaming';
  hook: string;
  concept: string;
  duration: string;
  platform: string;
  suggestedFormat: string;
}

export interface ThumbnailConcept {
  thumbnailConcept: string;
  subjectPlacement: string;
  backgroundConcept: string;
  lighting: string;
  cameraAngle: string;
  colorGrading: string;
  textPlacement: string;
  composition: string;
  depth: string;
  visualEffects: string;
  aiPrompt: string;
  generatedImageUrl?: string;
}

export interface ShortsPackage {
  title: string;
  hook: string;
  script: string;
  sceneBreakdown: SceneItem[];
  visualPrompts: string[];
  voiceover: string;
  ending: string;
  cta: string;
  caption: string;
  hashtags: string;
  editingNotes: string;
}

export interface EditingPlan {
  timelineOverview: string;
  cutsAndTrimming: string;
  zoomsAndPans: string;
  slowMotionAndSpeedRamping: string;
  transitions: string;
  textAndAnimations: string;
  soundEffects: string;
  musicTiming: string;
  motionEffectsAndMasking: string;
  colorGrading: string;
  endingCTA: string;
}

export interface TitleOption {
  title: string;
  style: string;
}

export interface SeoPackage {
  youtubeDescription: string;
  instagramCaption: string;
  facebookCaption: string;
  shortsCaption: string;
  hashtags: string[];
  primaryKeywords: string[];
  secondaryKeywords: string[];
  searchPhrases: string[];
  platformTags: string;
}

export type ClaimStatus = 'VERIFIED' | 'NEEDS_VERIFICATION' | 'LIKELY_INCORRECT' | 'OPINION';

export interface FactClaim {
  id: string;
  claim: string;
  status: ClaimStatus;
  statusLabel: string;
  confidence: 'High' | 'Medium' | 'Low';
  explanation: string;
  correction?: string;
  source?: string;
}

export interface FactCheckSummary {
  totalClaims: number;
  verifiedClaims: number;
  needsVerificationClaims: number;
  likelyIncorrectClaims: number;
  opinionClaims: number;
  correctedClaimsCount: number;
  accuracyScore: number;
  accuracyNote: string;
}

export interface FactCheckResult {
  summary: FactCheckSummary;
  claims: FactClaim[];
  originalScript: string;
  fixedScript: string;
  visualPromptAccuracyNotes?: string;
}

export interface CompleteVideoPackage {
  contentIdea: {
    concept: string;
    targetAudience: string;
  };
  hook: string;
  script: string;
  sceneBreakdown: SceneItem[];
  visualPrompts: string[];
  voiceoverText: string;
  editingPlan: {
    pacing: string;
    transitions: string;
    sfxAndMusic: string;
    textStyle: string;
  };
  titles: string[];
  description: string;
  caption: string;
  hashtags: string;
  factCheck?: FactCheckResult;
}

export interface ProjectItem {
  id: string;
  title: string;
  type: 'Script' | 'Thumbnail' | 'Ideas' | 'Shorts' | 'Editing' | 'TitleSEO' | 'CompleteVideo' | 'Voiceover' | 'FactCheck';
  topic: string;
  platform: string;
  language: string;
  content: any;
  createdAt: string;
  updatedAt: string;
  factChecked?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
