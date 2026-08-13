import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export const apiRouter = Router();

// Helper to safely get initialized GenAI client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[GEMINI_API_KEY Error] GEMINI_API_KEY environment variable is not defined.');
    throw new Error('GEMINI_API_KEY environment variable is missing on server. Please configure GEMINI_API_KEY in Vercel settings.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to safely parse JSON response from Gemini, removing markdown fences or trailing junk
function cleanParseJson(text: string | undefined, fallback: any = {}) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch (e1) {
    // Try stripping markdown code blocks ```json ... ```
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      // Try extracting first { ... } or [ ... ]
      const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (e3) {
          console.error('Failed to parse extracted JSON block from model response:', jsonMatch[1]);
        }
      }
      console.error('Failed to parse Gemini response text as JSON:', text);
      return fallback;
    }
  }
}

// Local filesystem projects database helper
const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.resolve(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PROJECTS_FILE)) {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify([]), 'utf-8');
    }
  } catch (err) {
    console.warn('Could not initialize local projects file:', err);
  }
}

function getSavedProjects() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading projects.json:', err);
    return [];
  }
}

function saveProjectsToFile(projects: any[]) {
  try {
    ensureDataFile();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing projects.json:', err);
  }
}

// -------------------------------------------------------------
// HEALTH CHECK API
// -------------------------------------------------------------
apiRouter.get(['/health', '/api/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
    environment: process.env.VERCEL ? 'vercel' : 'local',
  });
});

// -------------------------------------------------------------
// PROJECTS API
// -------------------------------------------------------------
apiRouter.get(['/projects', '/api/projects'], (req: Request, res: Response) => {
  try {
    const projects = getSavedProjects();
    res.json({ success: true, projects });
  } catch (err: any) {
    console.error('Get projects error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch projects' });
  }
});

apiRouter.post(['/projects', '/api/projects'], (req: Request, res: Response) => {
  try {
    const { title, type, content, data, topic, platform, language } = req.body || {};
    if (!title) {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }
    const projects = getSavedProjects();
    const newProject = {
      id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title,
      type: type || 'Script',
      topic: topic || title,
      platform: platform || 'YouTube',
      language: language || 'Hinglish',
      content: content || data || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.unshift(newProject);
    saveProjectsToFile(projects);
    res.json({ success: true, project: newProject });
  } catch (err: any) {
    console.error('Save project error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to save project' });
  }
});

apiRouter.delete(['/projects/:id', '/api/projects/:id'], (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let projects = getSavedProjects();
    projects = projects.filter((p: any) => p.id !== id);
    saveProjectsToFile(projects);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Delete project error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to delete project' });
  }
});

// -------------------------------------------------------------
// 0. AI FACT CHECKER & CONTENT ACCURACY ENDPOINT
// -------------------------------------------------------------
apiRouter.post(['/fact-check', '/api/fact-check'], async (req: Request, res: Response) => {
  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) {
      res.status(400).json({ success: false, error: 'Text/Script content is required for fact checking.' });
      return;
    }

    console.log(`[Fact Check] Processing ${text.length} chars...`);
    const ai = getGenAI();
    const prompt = `
You are RANJAY AI's Chief Fact Checker & Content Accuracy Auditor.
Analyze the following text or video script to extract and strictly verify all factual claims, numbers, prices, measurements, dates, scientific facts, historical records, and statistics.

Input Text:
"""
${text}
"""

STRICT FACTUAL ACCURACY & SOURCE SAFETY RULES:
1. NEVER INVENT OR FABRICATE fake websites, URLs, studies, researchers, organizations, statistics, prices, or citations.
2. If reliable verification is unavailable for a claim or number, assign status "NEEDS_VERIFICATION" and set source to "Unable to reliably verify this claim."
3. Distinguish clearly between:
   - FACT (Established scientific or historical reality)
   - ESTIMATE ("Current estimates indicate...")
   - OPINION / SUBJECTIVE (Personal opinion, aesthetic, or creative choice)
   - HYPOTHESIS / UNVERIFIED (Unproven theory or viral rumor)
   - EXAGGERATION (Hyperbolic phrasing requiring grounded language)
4. For numbers, prices, distances, weight, speed, population, dates, percentages, rankings, records, and scientific measurements:
   - If an exact number cannot be verified, mark status as "NEEDS_VERIFICATION". Do NOT invent a fake number.
5. For date-aware or time-sensitive facts (current rankings, tech specs, prices):
   - Include a clear note "Current information should be verified before publishing." if relevant.
6. Assign one of 4 statuses to each claim:
   - "VERIFIED" (🟢 VERIFIED / WELL-SUPPORTED) — only when backed by adequate evidence.
   - "NEEDS_VERIFICATION" (🟡 NEEDS VERIFICATION) — when exact evidence or numbers are unconfirmed.
   - "LIKELY_INCORRECT" (🔴 LIKELY INCORRECT) — when demonstrably false or contradicted by reliable science/history.
   - "OPINION" (⚪ OPINION / SUBJECTIVE) — for subjective/creative claims.
7. Generate "fixedScript" ("✨ FIX MY SCRIPT"):
   - Correct questionable claims when reliable evidence is available.
   - Remove unsupported exaggerations while keeping the storytelling engaging.
   - Preserve original style, tone, and topic.
   - Use safe nuanced phrasing ("Researchers have suggested...", "Current estimates indicate...") where appropriate.

Return a JSON object:
{
  "summary": {
    "totalClaims": number,
    "verifiedClaims": number,
    "needsVerificationClaims": number,
    "likelyIncorrectClaims": number,
    "opinionClaims": number,
    "correctedClaimsCount": number,
    "accuracyScore": number, // 0 to 100 percentage
    "accuracyNote": "Accuracy confidence score disclaimer string"
  },
  "claims": [
    {
      "id": "claim_1",
      "claim": "Claim text extract",
      "status": "VERIFIED | NEEDS_VERIFICATION | LIKELY_INCORRECT | OPINION",
      "statusLabel": "🟢 VERIFIED / WELL-SUPPORTED | 🟡 NEEDS VERIFICATION | 🔴 LIKELY INCORRECT | ⚪ OPINION / SUBJECTIVE",
      "confidence": "High | Medium | Low",
      "explanation": "Brief clear explanation of accuracy evaluation",
      "correction": "Suggested accurate correction or safer wording if problematic",
      "source": "Authoritative source reference or 'Unable to reliably verify this claim.'"
    }
  ],
  "originalScript": "Exact input text",
  "fixedScript": "Fact-checked and corrected version of the script",
  "visualPromptAccuracyNotes": "Note on visual prompts accuracy relative to real-world history or physics"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanParseJson(response.text);
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Fact checking error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fact check content' });
  }
});

// -------------------------------------------------------------
// 1. AI SCRIPT GENERATOR
// -------------------------------------------------------------
apiRouter.post(['/generate-script', '/api/generate-script'], async (req: Request, res: Response) => {
  try {
    const { topic, platform, duration, language, style, factCheckMode } = req.body || {};
    if (!topic) {
      res.status(400).json({ success: false, error: 'Topic is required' });
      return;
    }

    console.log(`[Generate Script] Topic: "${topic}" Platform: ${platform || 'YouTube'}`);
    const ai = getGenAI();
    const factCheckInstruction = factCheckMode !== false ? `
FACT-CHECK MODE IS ACTIVE:
- Prioritize factual accuracy over sensationalized wording.
- Do not fabricate numbers, prices, scientific measurements, or false historical facts.
- Distinguish between established facts and hypotheses or estimates (use language like 'current estimates indicate' or 'researchers suggest').
` : '';

    const prompt = `
You are RANJAY AI, an elite viral video content creator and scriptwriter for YouTube, Shorts, Instagram Reels, and Facebook Reels.
Generate a complete, highly engaging video script package for:
Topic: ${topic}
Platform: ${platform || 'YouTube'}
Target Duration: ${duration || '60 sec'}
Language: ${language || 'Hinglish'}
Style/Tone: ${style || 'Informative'}
${factCheckInstruction}

Return a valid JSON object matching this structure:
{
  "title": "A catchy, viral video title",
  "hook": "Attention-grabbing hook (0-5 seconds) to stop scrolling",
  "introduction": "Brief intro establishing value",
  "script": "Full word-for-word spoken script with narration and timestamps",
  "sceneBreakdown": [
    {
      "time": "0:00 - 0:05",
      "visual": "Visual camera angle / graphics description",
      "voiceover": "Spoken line",
      "onScreenText": "Text overlay"
    }
  ],
  "voiceoverText": "Clean continuous voiceover script suitable for speech synthesis",
  "onScreenText": "List or paragraph of all text overlays to show on screen",
  "visualSuggestions": "Camera movements, lighting, and frame composition tips",
  "brollSuggestions": "List of B-roll clips, stock video ideas, or screen recordings",
  "ending": "Strong punchline or summary before CTA",
  "cta": "Compelling Call To Action (Like, Subscribe, Comment prompt)"
}

Ensure the language is naturally written in ${language || 'Hinglish'}. Write engaging, energetic copy that maximizes watch time.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanParseJson(response.text);
    res.json({ success: true, script: parsed });
  } catch (error: any) {
    console.error('Script generation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate script' });
  }
});

// -------------------------------------------------------------
// 2. CONTENT IDEA GENERATOR (20 Ideas)
// -------------------------------------------------------------
apiRouter.post(['/generate-ideas', '/api/generate-ideas'], async (req: Request, res: Response) => {
  try {
    const { niche, language } = req.body || {};
    if (!niche) {
      res.status(400).json({ success: false, error: 'Niche is required' });
      return;
    }

    console.log(`[Generate Ideas] Niche: "${niche}"`);
    const ai = getGenAI();
    const prompt = `
You are RANJAY AI, an expert content strategist.
Generate AT LEAST 20 high-performing viral video content ideas for the niche: "${niche}".
Language preference: ${language || 'Hinglish'}.

Categorize each idea into one of these types:
- Trending-style
- Educational
- Entertainment
- Suspense
- Emotional
- Facts
- Gaming

Return a JSON array of 20 objects, each having:
{
  "id": number,
  "title": "Catchy Idea Title",
  "category": "Educational | Trending-style | Entertainment | Suspense | Emotional | Facts | Gaming",
  "hook": "High-converting 3-second opening hook",
  "concept": "Brief concept explanation",
  "duration": "15s | 30s | 60s | 3m | 5m | 10m",
  "platform": "YouTube | YouTube Shorts | Instagram Reels | Facebook Reels",
  "suggestedFormat": "Talking Head | Screen Capture | Cinematic VLOG | Animated | Skit | Reaction"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanParseJson(response.text, []);
    res.json({ success: true, ideas: parsed });
  } catch (error: any) {
    console.error('Ideas generation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate content ideas' });
  }
});

// -------------------------------------------------------------
// 3. AI THUMBNAIL ASSISTANT (Multimodal Image Analysis + Prompt)
// -------------------------------------------------------------
apiRouter.post(['/analyze-thumbnail', '/api/analyze-thumbnail'], async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, description, format } = req.body || {};
    const ai = getGenAI();

    let contents: any;
    const userPromptText = `
You are RANJAY AI, a top YouTube & Reels Thumbnail Designer and Visual Strategist.
Analyze this request ${imageBase64 ? 'and uploaded photo/image' : ''} to build a high-CTR thumbnail concept.
Format requested: ${format || 'YouTube Thumbnail (16:9)'}.
User notes/context: "${description || 'Create an explosive viral thumbnail design'}"

Return a JSON object:
{
  "thumbnailConcept": "Overall high-CTR visual story concept",
  "subjectPlacement": "Positioning of main person/object (e.g., Right 1/3 cut-out with shocked facial expression)",
  "backgroundConcept": "Background color, blur, texture or environment",
  "lighting": "Key light, rim light glow, neon contrast colors",
  "cameraAngle": "Camera angle (e.g., Low angle, wide-lens close up)",
  "colorGrading": "Color palette (e.g., High contrast Yellow & Dark Blue, saturated skin tones)",
  "textPlacement": "Font style, 3D text overlay, 2-3 words maximum, text position",
  "composition": "Focal points, rule of thirds, depth layers",
  "depth": "Foreground elements, background blur level (bokeh)",
  "visualEffects": "Glow outline, embers, arrows, shadows, spark particles",
  "aiPrompt": "Complete detailed AI image generation prompt suitable for Midjourney/Imagen/DALL-E to recreate this thumbnail visual"
}
`;

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: userPromptText },
        ],
      };
    } else {
      contents = userPromptText;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanParseJson(response.text);
    res.json({ success: true, concept: parsed });
  } catch (error: any) {
    console.error('Thumbnail analysis error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to analyze thumbnail' });
  }
});

// -------------------------------------------------------------
// 4. IMAGE GENERATION ENDPOINT
// -------------------------------------------------------------
apiRouter.post(['/generate-image', '/api/generate-image'], async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio } = req.body || {};
    if (!prompt) {
      res.status(400).json({ success: false, error: 'Prompt is required' });
      return;
    }

    console.log(`[Generate Image] Prompt: "${prompt.substring(0, 40)}..."`);
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '16:9',
        },
      },
    });

    let imageUrl = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (imageUrl) {
      res.json({ success: true, imageUrl });
    } else {
      res.status(400).json({
        success: false,
        error: 'Image generation model did not return image data.',
      });
    }
  } catch (error: any) {
    console.error('Image generation API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image generation model error. Check prompt or API limits.',
    });
  }
});

// -------------------------------------------------------------
// 5. SHORTS MAKER
// -------------------------------------------------------------
apiRouter.post(['/generate-shorts', '/api/generate-shorts'], async (req: Request, res: Response) => {
  try {
    const { topic, duration, language, style, factCheckMode } = req.body || {};
    if (!topic) {
      res.status(400).json({ success: false, error: 'Topic is required' });
      return;
    }

    console.log(`[Generate Shorts] Topic: "${topic}"`);
    const ai = getGenAI();
    const factCheckInstruction = factCheckMode !== false ? `
FACT-CHECK & ACCURACY MANDATE:
- Do NOT fabricate numbers, statistics, or historical facts.
- Verify numbers and claims or phrase them cautiously ("Estimates suggest...", "Reports state...").
` : '';

    const prompt = `
You are RANJAY AI Shorts & Reels Specialist.
Create a complete Short Video Package for:
Topic: ${topic}
Duration: ${duration || '30 sec'}
Language: ${language || 'Hinglish'}
Style: ${style || 'Fast-paced viral'}
${factCheckInstruction}

Return a JSON object:
{
  "title": "Viral Short Title",
  "hook": "0-3s scrolling-stopper line",
  "script": "Full word-for-word spoken text",
  "sceneBreakdown": [
    {
      "time": "0-3s",
      "visual": "Fast cuts / camera angle",
      "audio": "Voiceover line",
      "overlayText": "Bold text animation"
    }
  ],
  "visualPrompts": ["Prompt for Scene 1 AI image/video", "Prompt for Scene 2"],
  "voiceover": "Continuous clean text for voiceover",
  "ending": "Climax / Twist / Summary",
  "cta": "Follow for part 2 / Subscribe now",
  "caption": "Shorts/Reels caption with emojis",
  "hashtags": "#Shorts #Reels #Viral #TopicHashtags",
  "editingNotes": "Music beat sync, text jump cuts, zoom speed notes"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanParseJson(response.text);
    res.json({ success: true, shortsPackage: parsed });
  } catch (error: any) {
    console.error('Shorts generation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate Shorts package' });
  }
});

// -------------------------------------------------------------
// 6. CAPCUT / VIDEO EDITING ASSISTANT
// -------------------------------------------------------------
apiRouter.post(['/generate-editing-plan', '/api/generate-editing-plan'], async (req: Request, res: Response) => {
  try {
    const { footageDescription, videoType } = req.body || {};
    if (!footageDescription) {
      res.status(400).json({ success: false, error: 'Footage description is required' });
      return;
    }

    console.log(`[Editing Plan] Footages: "${footageDescription.substring(0, 40)}..."`);
    const ai = getGenAI();
    const prompt = `
You are RANJAY AI Lead Video Editor (CapCut & Premiere Pro Master).
Create a step-by-step beginner-friendly video editing plan for this footage description:
"${footageDescription}"
Video Type: ${videoType || 'Short / Reel / YouTube Video'}

Return a JSON object:
{
  "timelineOverview": "Structured timeline breakdown (Intro, Body, Climax, Outro)",
  "cutsAndTrimming": "Where to cut fluff, jump cuts, dead pauses removal",
  "zoomsAndPans": "Keyframe zoom-ins at punchlines or important words",
  "slowMotionAndSpeedRamping": "Exact points to apply 0.5x slow-mo or 2x speed ramp",
  "transitions": "CapCut transitions (e.g. Pull In, Whip Spin, Glitch, Blur Flash)",
  "textAndAnimations": "Font style, auto-captions animation, pop-up text presets",
  "soundEffects": "SFX recommendations (Whoosh, Pop, Cinematic Boom, Mouse Click)",
  "musicTiming": "Background track beat matching and volume ducking level (-18dB under voice)",
  "motionEffectsAndMasking": "Masking effects, background removal, split screen or sticker overlays",
  "colorGrading": "Filter preset (e.g., Vibrant Teal & Orange, Dark Moody, High Contrast)",
  "endingCTA": "Outro card overlay & subscribe animation placement"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanParseJson(response.text);
    res.json({ success: true, editingPlan: parsed });
  } catch (error: any) {
    console.error('Editing plan generation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate editing plan' });
  }
});

// -------------------------------------------------------------
// 7. TITLE GENERATOR (10 Options)
// -------------------------------------------------------------
apiRouter.post(['/generate-titles', '/api/generate-titles'], async (req: Request, res: Response) => {
  try {
    const { topic, language } = req.body || {};
    if (!topic) {
      res.status(400).json({ success: false, error: 'Topic is required' });
      return;
    }

    console.log(`[Generate Titles] Topic: "${topic}"`);
    const ai = getGenAI();
    const prompt = `
You are RANJAY AI Video Title Strategist.
Generate 10 magnetic, high-CTR video title options for topic: "${topic}" in ${language || 'Hinglish/English'}.

Return a JSON array of 10 title objects:
[
  { "title": "...", "style": "Curiosity" },
  { "title": "...", "style": "Emotional" },
  { "title": "...", "style": "Educational" },
  { "title": "...", "style": "Viral-style" },
  { "title": "...", "style": "Professional" },
  { "title": "...", "style": "Short & Punchy" },
  { "title": "...", "style": "Search-friendly (SEO)" },
  { "title": "...", "style": "Controversial / Debate" },
  { "title": "...", "style": "Storytelling" },
  { "title": "...", "style": "Numbers & Listicle" }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanParseJson(response.text, []);
    res.json({ success: true, titles: parsed });
  } catch (error: any) {
    console.error('Title generation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate titles' });
  }
});

// -------------------------------------------------------------
// 8. DESCRIPTION & CAPTION & HASHTAG GENERATOR
// -------------------------------------------------------------
apiRouter.post(['/generate-seo', '/api/generate-seo'], async (req: Request, res: Response) => {
  try {
    const { topic, details, language } = req.body || {};
    if (!topic) {
      res.status(400).json({ success: false, error: 'Topic is required' });
      return;
    }

    console.log(`[Generate SEO] Topic: "${topic}"`);
    const ai = getGenAI();
    const prompt = `
You are RANJAY AI YouTube & Social Media SEO Optimization Expert.
Generate complete metadata for:
Topic: "${topic}"
Details: "${details || ''}"
Language: ${language || 'Hinglish'}

Return a JSON object:
{
  "youtubeDescription": "Formatted YouTube description with timestamps placeholder, links, summary, and CTA",
  "instagramCaption": "Engaging Instagram Reel caption with hooks, line breaks, and emojis",
  "facebookCaption": "Facebook Reel/Post caption tailored for FB audience engagement",
  "shortsCaption": "Ultra punchy Shorts caption",
  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#Hashtag5"],
  "primaryKeywords": ["keyword 1", "keyword 2", "keyword 3"],
  "secondaryKeywords": ["keyword A", "keyword B", "keyword C"],
  "searchPhrases": ["search phrase 1", "search phrase 2"],
  "platformTags": "Comma separated tags list for YouTube tag box (max 400 chars)"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanParseJson(response.text);
    res.json({ success: true, seo: parsed });
  } catch (error: any) {
    console.error('SEO generation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate SEO metadata' });
  }
});

// -------------------------------------------------------------
// 9. COMPLETE VIDEO CREATOR (Master All-In-One Feature)
// -------------------------------------------------------------
apiRouter.post(['/generate-complete-video', '/api/generate-complete-video'], async (req: Request, res: Response) => {
  try {
    const { topic, platform, duration, language, factCheckMode } = req.body || {};
    if (!topic) {
      res.status(400).json({ success: false, error: 'Topic is required' });
      return;
    }

    console.log(`[Generate Complete Video] Topic: "${topic}"`);
    const ai = getGenAI();
    const factCheckInstruction = factCheckMode !== false ? `
CRITICAL FACT-CHECKING MANDATE (FACTS & ACCURACY FIRST):
- Prioritize factual accuracy and real data over sensationalized false statements.
- Never invent numbers, dates, prices, scientific measurements, or fake quotes.
- Distinguish between established scientific facts, estimates, subjective opinions, and hypotheses.
- Use grounded, objective phrasing ("According to estimates...", "Research indicates...").
` : '';

    const prompt = `
You are RANJAY AI Master Video Production Assistant.
Generate the COMPLETE end-to-end creator suite for a video on topic: "${topic}".
Platform: ${platform || 'YouTube Shorts'}
Duration: ${duration || '60 sec'}
Language: ${language || 'Hinglish'}
${factCheckInstruction}

Return a JSON object containing ALL 11 elements:
{
  "contentIdea": {
    "concept": "Core value proposition and creative storyline angle",
    "targetAudience": "Who this appeals to most"
  },
  "hook": "First 3 seconds attention grabber line",
  "script": "Full spoken video script narrative",
  "sceneBreakdown": [
    {
      "time": "0:00 - 0:05",
      "visual": "Camera frame / action description",
      "voiceover": "Spoken sentence",
      "textOverlay": "On screen text"
    }
  ],
  "visualPrompts": [
    "AI Image prompt for intro scene",
    "AI Image prompt for middle scene",
    "AI Image prompt for thumbnail background"
  ],
  "voiceoverText": "Clean text for TTS audio generation",
  "editingPlan": {
    "pacing": "Fast cuts / slow build",
    "transitions": "Key transition effects",
    "sfxAndMusic": "Sound effects and background music style",
    "textStyle": "Font style and animation preset"
  },
  "titles": [
    "Title Option 1 (Viral)",
    "Title Option 2 (Curiosity)",
    "Title Option 3 (SEO)"
  ],
  "description": "YouTube or Reel full description text",
  "caption": "Social media caption with emojis",
  "hashtags": "#Shorts #Viral #Reels #Creator"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = cleanParseJson(response.text);
    res.json({ success: true, completePackage: parsed });
  } catch (error: any) {
    console.error('Complete video package error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate complete video package' });
  }
});

// -------------------------------------------------------------
// 10. AI CREATOR CHAT ("Mohtarma / Ranjay AI Assistant")
// -------------------------------------------------------------
apiRouter.post(['/creator-chat', '/api/creator-chat'], async (req: Request, res: Response) => {
  try {
    const { messages, userPrompt, language } = req.body || {};
    console.log(`[Creator Chat] ${userPrompt || 'message received'}`);
    const ai = getGenAI();

    const systemInstruction = `
You are "Mohtarma" / RANJAY AI Creator Assistant — a friendly, smart, enthusiastic AI assistant built specifically for YouTube, Shorts, Instagram Reels, and Facebook Reels creators.

IDENTITY & PERSONALITY:
- Your name is Mohtarma / RANJAY AI Assistant.
- Speak naturally in ${language || 'Hinglish'} (a smooth blend of Hindi and English) or pure Hindi/English/Bhojpuri if requested.
- Keep responses conversational, concise, respectful, energetic, and highly actionable for content creators.
- You specialize in video scripts, thumbnail ideas, title ideas, CapCut editing tricks, channel growth, and viral content strategies.
- If user asks in Hindi/Hinglish (e.g. "30 second cricket script banao"), reply in natural energetic Hinglish with clear formatting, bullet points, and code/script blocks.
`;

    const formattedContents: any[] = [];
    if (Array.isArray(messages) && messages.length > 0) {
      for (const m of messages) {
        formattedContents.push({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text || m.content || '' }],
        });
      }
    }

    if (userPrompt) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: userPrompt }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents.length > 0 ? formattedContents : userPrompt || 'Namaste! Main Mohtarma hoon, aapki AI Creator Assistant. Aaj kya create karna hai?',
      config: {
        systemInstruction,
      },
    });

    res.json({ success: true, reply: response.text || 'Namaste!' });
  } catch (error: any) {
    console.error('Creator chat error:', error);
    res.status(500).json({ success: false, error: error.message || 'Chat assistant error' });
  }
});

// -------------------------------------------------------------
// 11. VOICEOVER TTS ENDPOINT
// -------------------------------------------------------------
apiRouter.post(['/generate-tts', '/api/generate-tts'], async (req: Request, res: Response) => {
  try {
    const { text, voice } = req.body || {};
    if (!text) {
      res.status(400).json({ success: false, error: 'Text is required for TTS' });
      return;
    }

    console.log(`[TTS Generation] Text length: ${text.length}`);
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ success: true, base64Audio });
    } else {
      res.status(400).json({ success: false, error: 'TTS model did not return audio data.' });
    }
  } catch (error: any) {
    console.error('TTS API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'TTS generation unavailable. Frontend native TTS fallback will be used.',
    });
  }
});
