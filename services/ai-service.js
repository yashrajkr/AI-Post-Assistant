/**
 * services/ai-service.js
 * AI provider chain with timeout + retry + fallback.
 *
 * Order of preference:
 *   1. The provider named by AI_PROVIDER (if its key is set).
 *   2. The other configured provider (if its key is set).
 *   3. Mock provider (always works, returns deterministic sample output).
 *
 * Every public method returns { success, provider, content, error }.
 */

const { env } = require('../config/env');
const logger = require('../utils/logger');
const { cleanTag, templatePrefix } = require('../utils/helpers');

/* ------------------- Prompt builder ------------------- */

function makePrompt(input, user, opts = {}) {
  const brandBrain = opts.brandBrain || null;
  const memory = opts.memory || null;
  const withScore = opts.withScore !== false; // default true

  let brandContext = `Brand voice: ${JSON.stringify(user.brandVoice || {})}`;
  let memoryContext = '';
  let bannedWordsLine = '';
  let audienceLine = `Audience: ${input.audience || 'Indian beginner audience'}`;
  let toneLine = `Tone: ${input.tone}`;

  if (brandBrain) {
    brandContext = `Brand brain:
- Brand name: ${brandBrain.brandName || 'N/A'}
- Tagline: ${brandBrain.tagline || 'N/A'}
- Niche: ${brandBrain.niche || input.niche}
- Target audience: ${brandBrain.audience || input.audience || 'Indian beginner audience'}
- Preferred tones: ${(brandBrain.tones || []).join(', ') || input.tone}
- CTA style: ${brandBrain.ctaStyle || 'direct'}`;
    audienceLine = `Audience: ${brandBrain.audience || input.audience || 'Indian beginner audience'}`;
    toneLine = `Tone: ${(brandBrain.tones && brandBrain.tones.length > 0) ? brandBrain.tones.join(', ') : input.tone}`;
    if (brandBrain.bannedWords && brandBrain.bannedWords.length > 0) {
      bannedWordsLine = `\nBANNED WORDS (never use these): ${brandBrain.bannedWords.join(', ')}`;
    }
  }

  if (memory && memory.length > 0) {
    const hashtags = memory.filter((m) => m.key === 'hashtag').slice(0, 8).map((m) => m.value);
    const tones = memory.filter((m) => m.key === 'tone').slice(0, 3).map((m) => m.value);
    const titles = memory.filter((m) => m.key === 'title').slice(0, 3).map((m) => m.value);
    const parts = [];
    if (hashtags.length) parts.push(`Previously used hashtags (avoid repeating exactly): ${hashtags.join(', ')}`);
    if (tones.length) parts.push(`Previously used tones (try variation): ${tones.join(', ')}`);
    if (titles.length) parts.push(`Previously generated titles (find fresh angles): ${titles.slice(0, 3).map((t) => `"${t}"`).join('; ')}`);
    if (parts.length) memoryContext = `\n\nAI MEMORY (user history):\n${parts.join('\n')}`;
  }

  const scoreLine = withScore
    ? `\n\nALSO return a "score" object with: hook (0-100), seo (0-100), cta (0-100), readability (0-100), virality (0-100), emotion (0-100), total (0-100, average of the 6), and "suggestions" array of { dimension, score, suggestion } for any dimension scoring below 85.`
    : '';

  return `You are a social media strategist for Indian creators, students, coaching institutes and small businesses.
Create a ready-to-post package.

Platform: ${input.platform}
Niche: ${input.niche}
Language: ${input.language}
Goal: ${input.goal}
${toneLine}
Template: ${input.template}
${audienceLine}
Location: ${input.location || 'India'}
${brandContext}${memoryContext}${bannedWordsLine}${scoreLine}

Content idea: ${input.content}

Return strict JSON with keys: titles, captions, hashtags, keywords, description, cta, thumbnail, postingTip, improvementSuggestion, whyThisWorks${withScore ? ', score' : ''}.`;
}

function normalizeAiOutput(data) {
  if (!data || typeof data !== 'object') data = {};
  const out = {
    titles: Array.isArray(data.titles) ? data.titles.slice(0, 5) : [],
    captions: Array.isArray(data.captions) ? data.captions.slice(0, 3) : [],
    hashtags: Array.isArray(data.hashtags) ? data.hashtags.slice(0, 5) : [],
    keywords: Array.isArray(data.keywords) ? data.keywords.slice(0, 10) : [],
    description: String(data.description || ''),
    cta: String(data.cta || ''),
    thumbnail: Array.isArray(data.thumbnail) ? data.thumbnail.slice(0, 5) : [],
    postingTip: String(data.postingTip || ''),
    improvementSuggestion: String(data.improvementSuggestion || ''),
    whyThisWorks: String(data.whyThisWorks || ''),
  };
  if (data.score && typeof data.score === 'object') {
    out.score = normalizeScore(data.score);
  }
  return out;
}

function normalizeScore(s) {
  if (!s || typeof s !== 'object') return null;
  const dims = ['hook', 'seo', 'cta', 'readability', 'virality', 'emotion'];
  const score = {};
  let total = 0;
  let count = 0;
  for (const d of dims) {
    const v = Number(s[d]);
    score[d] = Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 0;
    total += score[d];
    count++;
  }
  score.total = Number.isFinite(Number(s.total)) ? Math.max(0, Math.min(100, Math.round(Number(s.total)))) : Math.round(total / count);
  score.suggestions = Array.isArray(s.suggestions)
    ? s.suggestions.slice(0, 6).map((sg) => ({
        dimension: String(sg.dimension || ''),
        score: Number(sg.score) || 0,
        suggestion: String(sg.suggestion || ''),
      }))
    : [];
  return score;
}

function parsePotentialJson(text) {
  if (typeof text !== 'string') return {};
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned || '{}');
  } catch {
    return {};
  }
}

/* ------------------- Provider implementations ------------------- */

async function callWithTimeout(promiseFactory, ms, label) {
  return await Promise.race([
    promiseFactory(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)
    ),
  ]);
}

async function generateWithOpenAI(input, user, opts = {}) {
  const payload = JSON.stringify({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'Return only valid JSON.' },
      { role: 'user', content: makePrompt(input, user, opts) },
    ],
    temperature: 0.7,
  });

  const response = await callWithTimeout(
    () =>
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: payload,
      }),
    env.AI_TIMEOUT_MS,
    'openai'
  );

  if (!response.ok) {
    const txt = await response.text().catch(() => '');
    throw new Error(`OpenAI error ${response.status}: ${txt.slice(0, 200)}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content || '{}';
  return normalizeAiOutput(parsePotentialJson(text));
}

async function generateWithGemini(input, user, opts = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
  const response = await callWithTimeout(
    () =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: makePrompt(input, user, opts) }] }],
        }),
      }),
    env.AI_TIMEOUT_MS,
    'gemini'
  );

  if (!response.ok) {
    const txt = await response.text().catch(() => '');
    throw new Error(`Gemini error ${response.status}: ${txt.slice(0, 200)}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return normalizeAiOutput(parsePotentialJson(text));
}

async function generateWithGrok(input, user, opts = {}) {
  const response = await callWithTimeout(
    () =>
      fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.GROK_MODEL,
          messages: [
            { role: 'system', content: 'Return only valid JSON.' },
            { role: 'user', content: makePrompt(input, user, opts) },
          ],
          temperature: 0.7,
        }),
      }),
    env.AI_TIMEOUT_MS,
    'grok'
  );

  if (!response.ok) {
    const txt = await response.text().catch(() => '');
    throw new Error(`Grok error ${response.status}: ${txt.slice(0, 200)}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content || '{}';
  return normalizeAiOutput(parsePotentialJson(text));
}

/**
 * Groq (groq.com) — OpenAI-compatible chat completions API, free tier.
 * Not to be confused with "Grok" (xAI, api.x.ai) above — different company.
 */
async function generateWithGroq(input, user, opts = {}) {
  const response = await callWithTimeout(
    () =>
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.GROQ_MODEL,
          messages: [
            { role: 'system', content: 'Return only valid JSON.' },
            { role: 'user', content: makePrompt(input, user, opts) },
          ],
          temperature: 0.7,
        }),
      }),
    env.AI_TIMEOUT_MS,
    'groq'
  );

  if (!response.ok) {
    const txt = await response.text().catch(() => '');
    throw new Error(`Groq error ${response.status}: ${txt.slice(0, 200)}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content || '{}';
  return normalizeAiOutput(parsePotentialJson(text));
}

/**
 * Shared helper for the secondary features (score/repurpose/calendar/
 * campaign/document/brand-health) — both OpenAI and Groq speak the same
 * chat-completions wire format, so one function drives both.
 */
async function chatJson({ baseUrl, apiKey, model, prompt, temperature = 0.7, label }) {
  const resp = await callWithTimeout(
    () =>
      fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'Return only valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature,
        }),
      }),
    env.AI_TIMEOUT_MS,
    label
  );
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`${label} error ${resp.status}: ${txt.slice(0, 200)}`);
  }
  const json = await resp.json();
  return json.choices?.[0]?.message?.content || '{}';
}

function groqChatJson(prompt, label, temperature = 0.7) {
  return chatJson({
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL,
    prompt,
    temperature,
    label,
  });
}

function generateMock(input, user) {
  const prefix = templatePrefix(input.template);
  const niche = input.niche;
  const platform = input.platform;
  const goal = input.goal;
  const langNote = input.language === 'Hinglish' ? 'Hinglish friendly' : input.language;
  const brand = user.brandVoice?.brandName || 'your brand';
  const location = input.location || 'India';
  const audience = input.audience || 'beginners';
  return {
    titles: [
      `${prefix}: ${niche} idea for ${platform}`,
      `How ${audience} can use this ${niche} tip`,
      `${goal} focused ${niche} post for ${location}`,
      `Simple ${niche} content that people understand fast`,
      `${brand}: ${niche} update worth sharing`,
    ],
    captions: [
      `${prefix} 🚀\n\n${input.content}\n\nThis is made for ${audience} who want clear value without confusion. Save this and share it with someone who needs it.`,
      `If you are interested in ${niche}, this post will help you take one practical step today.\n\n${input.content}\n\nComment "READY" if you want more like this.`,
      `${langNote} caption idea:\n\n${input.content}\n\n${goal === 'Sales' ? 'DM us to order or ask for details.' : 'Follow for more simple and useful posts.'}`,
    ],
    hashtags: [`#${cleanTag(niche)}`, `#${cleanTag(platform)}`, `#${cleanTag(goal)}`, `#${cleanTag(location)}`, '#PostReadyAI'],
    keywords: [niche, platform, goal, location, audience, 'caption idea', 'content strategy', 'social media post', 'Indian creators', 'small business marketing'],
    description: `${prefix} post package for ${platform}. Topic: ${input.content}. This content targets ${audience} in ${location} and is optimized for ${goal}.`,
    cta: goal === 'Sales' ? 'DM now to get details.' : goal === 'Admissions' ? 'Message "ADMISSION" to know batch details.' : 'Follow for more practical posts.',
    thumbnail: [`${prefix}`, `${goal} Made Simple`, `${niche} Tips`, `Save This`, `${location} Update`],
    postingTip: `Post when your audience is active. For Indian student/business audiences, start testing 7–9 PM and compare results for 7 days.`,
    improvementSuggestion: `Add one real example, result, price, location or before/after proof. That will make the post more believable.`,
    whyThisWorks: `It connects the topic with the user goal, keeps hashtags limited, adds a clear CTA, and makes the post easy to copy into ${platform}.`,
  };
}

/* ------------------- Retry helper ------------------- */

async function withRetry(fn, retries, label) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      logger.warn(`[ai] ${label} attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/* ------------------- Public API ------------------- */

/**
 * Build the provider chain based on env config + which keys are present.
 * Returns an ordered array of { name, fn }.
 */
function buildChain() {
  const chain = [];
  const primary = env.AI_PROVIDER;

  const candidates = {
    openai: { name: 'openai', available: env.hasOpenAI, fn: generateWithOpenAI },
    gemini: { name: 'gemini', available: env.hasGemini, fn: generateWithGemini },
    grok: { name: 'grok', available: env.hasGrok, fn: generateWithGrok },
    groq: { name: 'groq', available: env.hasGroq, fn: generateWithGroq },
  };

  // Primary first
  if (primary !== 'mock' && candidates[primary] && candidates[primary].available) {
    chain.push(candidates[primary]);
  }
  // Then the other configured providers
  for (const key of Object.keys(candidates)) {
    if (key === primary) continue;
    if (candidates[key].available) chain.push(candidates[key]);
  }
  // Mock always last
  chain.push({ name: 'mock', available: true, fn: generateMock });
  return chain;
}

async function generateContent(input, user, opts = {}) {
  const chain = buildChain();
  let lastError;

  for (const provider of chain) {
    try {
      if (provider.name === 'mock') {
        const content = generateMock(input, user);
        if (opts.withScore !== false) {
          content.score = mockScore(input);
        }
        return { success: true, provider: 'mock', content, error: null };
      }
      // Pass opts through so makePrompt can include brand brain + memory + score request
      const wrappedFn = () => provider.fn(input, user, opts);
      const content = await withRetry(wrappedFn, env.AI_MAX_RETRIES, provider.name);
      return { success: true, provider: provider.name, content, error: null };
    } catch (err) {
      lastError = err;
      logger.warn(`[ai] ${provider.name} failed permanently, moving to next provider: ${err.message}`);
    }
  }

  return {
    success: false,
    provider: null,
    content: null,
    error: lastError?.message || 'All AI providers failed.',
  };
}

function mockScore(input) {
  // Deterministic mock score for dev/preview
  const hash = (input.content || '').length;
  return {
    hook: 80 + (hash % 15),
    seo: 70 + (hash % 20),
    cta: 60 + (hash % 25),
    readability: 85 + (hash % 12),
    virality: 75 + (hash % 18),
    emotion: 80 + (hash % 14),
    total: 75 + (hash % 15),
    suggestions: [
      { dimension: 'cta', score: 71, suggestion: 'Your CTA is generic. Try a specific trigger like "Comment ADMISSION for batch details" — increases engagement ~30%.' },
      { dimension: 'seo', score: 84, suggestion: 'Add 2 more niche-specific hashtags (#JEEMains #PatnaCoaching) to boost discoverability.' },
    ],
  };
}

/**
 * Module 2: Re-score existing content without regenerating.
 */
async function scoreContent({ content, platform, niche, cta, hashtags }) {
  const chain = buildChain();
  const prompt = `Score this social media post across 6 dimensions (0-100 each).

Platform: ${platform}
Niche: ${niche || 'general'}
CTA: ${cta || '(none)'}
Hashtags: ${(hashtags || []).join(', ')}

Content to score:
${content}

Return strict JSON: { "hook": 0-100, "seo": 0-100, "cta": 0-100, "readability": 0-100, "virality": 0-100, "emotion": 0-100, "total": 0-100, "suggestions": [{ "dimension": "cta", "score": 71, "suggestion": "..." }] }
Include 1-3 suggestions for dimensions scoring below 85.`;

  for (const provider of chain) {
    try {
      if (provider.name === 'mock') {
        return { success: true, provider: 'mock', score: mockScore({ content }), error: null };
      }
      const result = await withRetry(async () => {
        if (provider.name === 'openai') {
          const resp = await callWithTimeout(
            () => fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
              body: JSON.stringify({
                model: env.OPENAI_MODEL,
                messages: [
                  { role: 'system', content: 'Return only valid JSON.' },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.3,
              }),
            }),
            env.AI_TIMEOUT_MS,
            'openai-score'
          );
          if (!resp.ok) throw new Error(`OpenAI score error ${resp.status}`);
          const json = await resp.json();
          return normalizeScore(parsePotentialJson(json.choices?.[0]?.message?.content || '{}'));
        }
        if (provider.name === 'gemini') {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
          const resp = await callWithTimeout(
            () => fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }),
            env.AI_TIMEOUT_MS,
            'gemini-score'
          );
          if (!resp.ok) throw new Error(`Gemini score error ${resp.status}`);
          const json = await resp.json();
          return normalizeScore(parsePotentialJson(json.candidates?.[0]?.content?.parts?.[0]?.text || '{}'));
        }
        if (provider.name === 'groq') {
          return normalizeScore(parsePotentialJson(await groqChatJson(prompt, 'groq-score', 0.3)));
        }
        throw new Error('Provider not supported for scoring');
      }, env.AI_MAX_RETRIES, provider.name + '-score');
      return { success: true, provider: provider.name, score: result, error: null };
    } catch (err) {
      logger.warn(`[ai] score ${provider.name} failed: ${err.message}`);
    }
  }
  return { success: false, provider: null, score: null, error: 'All AI providers failed for scoring.' };
}

/**
 * Module 6: Repurpose one piece of content into 6 platform versions.
 */
async function repurposeContent({ sourceContent, sourceType = 'text', platforms }) {
  const defaultPlatforms = ['Instagram', 'LinkedIn', 'X', 'Facebook', 'WhatsApp', 'YouTube'];
  const targetPlatforms = platforms && platforms.length ? platforms : defaultPlatforms;

  const prompt = `Take this source content and create platform-optimized versions.
Each version should be genuinely different — not just shortened, but rewritten for that platform's style and audience.

Source type: ${sourceType}
Source content:
${sourceContent}

Target platforms: ${targetPlatforms.join(', ')}

Return strict JSON: { "results": { "${targetPlatforms[0]}": { "caption": "...", "hashtags": ["..."], "cta": "..." }, ... } }
For each platform include: caption (or post/thread/message/title+description for YouTube), hashtags (3-5), and cta.`;

  const chain = buildChain();
  for (const provider of chain) {
    try {
      if (provider.name === 'mock') {
        return { success: true, provider: 'mock', results: mockRepurpose(sourceContent, targetPlatforms), error: null };
      }
      const result = await withRetry(async () => {
        if (provider.name === 'openai') {
          const resp = await callWithTimeout(
            () => fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
              body: JSON.stringify({
                model: env.OPENAI_MODEL,
                messages: [
                  { role: 'system', content: 'Return only valid JSON.' },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.7,
              }),
            }),
            env.AI_TIMEOUT_MS,
            'openai-repurpose'
          );
          if (!resp.ok) throw new Error(`OpenAI repurpose error ${resp.status}`);
          const json = await resp.json();
          return parsePotentialJson(json.choices?.[0]?.message?.content || '{}');
        }
        if (provider.name === 'gemini') {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
          const resp = await callWithTimeout(
            () => fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }),
            env.AI_TIMEOUT_MS,
            'gemini-repurpose'
          );
          if (!resp.ok) throw new Error(`Gemini repurpose error ${resp.status}`);
          const json = await resp.json();
          return parsePotentialJson(json.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
        }
        if (provider.name === 'groq') {
          return parsePotentialJson(await groqChatJson(prompt, 'groq-repurpose'));
        }
        throw new Error('Provider not supported for repurpose');
      }, env.AI_MAX_RETRIES, provider.name + '-repurpose');
      return { success: true, provider: provider.name, results: result.results || result, error: null };
    } catch (err) {
      logger.warn(`[ai] repurpose ${provider.name} failed: ${err.message}`);
    }
  }
  return { success: false, provider: null, results: null, error: 'All AI providers failed for repurpose.' };
}

function mockRepurpose(sourceContent, platforms) {
  const results = {};
  for (const p of platforms) {
    results[p] = {
      caption: `[${p} version] ${sourceContent.slice(0, 100)}...`,
      hashtags: ['#AI', '#Content', '#' + p.replace(/\s/g, '')],
      cta: 'Follow for more.',
    };
  }
  return results;
}

/**
 * Module 5: Analyze an image and return caption, alt text, hashtags, etc.
 * Requires vision-capable model (gpt-4o-mini supports vision).
 */
async function analyzeImage(imageBuffer, mimeType, options = {}) {
  const prompt = `Analyze this image and create a social media content package based on what you see.

Platform: ${options.platform || 'Instagram'}
Niche: ${options.niche || 'general'}
Tone: ${options.tone || 'engaging'}

Return strict JSON with keys:
{
  "caption": "an engaging caption suitable for the platform",
  "hook": "an attention-grabbing first line",
  "hashtags": ["3-5 relevant hashtags"],
  "altText": "descriptive alt text for accessibility",
  "cta": "a clear call to action",
  "keywords": ["5-7 relevant keywords"]
}`;

  // Try OpenAI Vision first (gpt-4o-mini supports vision)
  if (env.hasOpenAI) {
    try {
      const base64 = imageBuffer.toString('base64');
      const resp = await callWithTimeout(
        () => fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: env.OPENAI_MODEL === 'gpt-4o-mini' ? 'gpt-4o-mini' : 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Return only valid JSON.' },
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
                ],
              },
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
        }),
        env.AI_TIMEOUT_MS * 2, // double timeout for vision
        'openai-vision'
      );
      if (!resp.ok) throw new Error(`OpenAI vision error ${resp.status}`);
      const json = await resp.json();
      const text = json.choices?.[0]?.message?.content || '{}';
      return { success: true, provider: 'openai', result: parsePotentialJson(text), error: null };
    } catch (err) {
      logger.warn(`[ai] openai-vision failed: ${err.message}`);
    }
  }

  // Gemini Vision fallback
  if (env.hasGemini) {
    try {
      const base64 = imageBuffer.toString('base64');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      const resp = await callWithTimeout(
        () => fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64 } },
              ],
            }],
          }),
        }),
        env.AI_TIMEOUT_MS * 2,
        'gemini-vision'
      );
      if (!resp.ok) throw new Error(`Gemini vision error ${resp.status}`);
      const json = await resp.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      return { success: true, provider: 'gemini', result: parsePotentialJson(text), error: null };
    } catch (err) {
      logger.warn(`[ai] gemini-vision failed: ${err.message}`);
    }
  }

  // Mock fallback
  return {
    success: true,
    provider: 'mock',
    result: {
      caption: '[Mock] A great image worth sharing! Add your story here.',
      hook: '[Mock] Stop scrolling — this caught your eye for a reason.',
      hashtags: ['#PostReadyAI', '#Content', '#IndianCreators'],
      altText: '[Mock] Image uploaded by user for AI analysis.',
      cta: '[Mock] Follow for more content like this.',
      keywords: ['image', 'content', 'social', 'creator', 'india'],
    },
    error: null,
  };
}

/**
 * Health-check each configured provider with a tiny prompt.
 * Used by /api/ai/health.
 */
async function healthCheck() {
  const result = { mock: 'ok' };
  const probe = { content: 'hello', platform: 'Instagram', niche: 'general', language: 'English', goal: 'Reach', tone: 'neutral', template: 'general', audience: '', location: '' };
  const probeUser = { brandVoice: {} };

  if (env.hasOpenAI) {
    try {
      await withRetry(() => generateWithOpenAI(probe, probeUser), 1, 'openai-health');
      result.openai = 'ok';
    } catch (err) {
      result.openai = `down: ${err.message}`;
    }
  } else {
    result.openai = 'not-configured';
  }

  if (env.hasGemini) {
    try {
      await withRetry(() => generateWithGemini(probe, probeUser), 1, 'gemini-health');
      result.gemini = 'ok';
    } catch (err) {
      result.gemini = `down: ${err.message}`;
    }
  } else {
    result.gemini = 'not-configured';
  }

  if (env.hasGroq) {
    try {
      await withRetry(() => generateWithGroq(probe, probeUser), 1, 'groq-health');
      result.groq = 'ok';
    } catch (err) {
      result.groq = `down: ${err.message}`;
    }
  } else {
    result.groq = 'not-configured';
  }

  return result;
}

/**
 * v2: AI Content Calendar — generate a 7/14/30-day content plan.
 */
async function generateCalendar({ title, niche, durationDays = 30, platforms }) {
  const targetPlatforms = platforms && platforms.length ? platforms : ['Instagram', 'YouTube', 'LinkedIn'];
  const prompt = `You are a content strategist for Indian creators. Create a ${durationDays}-day content calendar.

Calendar title: ${title}
Niche: ${niche}
Target platforms: ${targetPlatforms.join(', ')}

Return strict JSON: { "days": [{ "day": 1, "date": "relative (Day 1, Day 2...)", "platform": "Instagram", "topic": "post topic", "hook": "attention-grabbing hook", "format": "Reel/Carousel/Story/Post", "bestTime": "7-9 PM", "notes": "quick tip" }] }

Rules:
- ${durationDays} entries, one per day
- Mix platforms (rotate through the target list)
- Include a variety of formats (Reel, Carousel, Post, Story, Live)
- Best times should be realistic for Indian audience (7-9 PM IST prime time, 8-10 AM morning)
- Topics should progress logically (e.g., educational series, weekly themes)
- Keep hooks punchy (under 10 words)`;

  const chain = buildChain();
  for (const provider of chain) {
    try {
      if (provider.name === 'mock') {
        return { success: true, provider: 'mock', result: mockCalendar(title, durationDays, targetPlatforms), error: null };
      }
      const result = await withRetry(async () => {
        if (provider.name === 'openai') {
          const resp = await callWithTimeout(
            () => fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
              body: JSON.stringify({
                model: env.OPENAI_MODEL,
                messages: [
                  { role: 'system', content: 'Return only valid JSON.' },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.7,
              }),
            }),
            env.AI_TIMEOUT_MS,
            'openai-calendar'
          );
          if (!resp.ok) throw new Error(`OpenAI calendar error ${resp.status}`);
          const json = await resp.json();
          return parsePotentialJson(json.choices?.[0]?.message?.content || '{}');
        }
        if (provider.name === 'gemini') {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
          const resp = await callWithTimeout(
            () => fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }),
            env.AI_TIMEOUT_MS,
            'gemini-calendar'
          );
          if (!resp.ok) throw new Error(`Gemini calendar error ${resp.status}`);
          const json = await resp.json();
          return parsePotentialJson(json.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
        }
        if (provider.name === 'groq') {
          return parsePotentialJson(await groqChatJson(prompt, 'groq-calendar'));
        }
        throw new Error('Provider not supported for calendar');
      }, env.AI_MAX_RETRIES, provider.name + '-calendar');
      return { success: true, provider: provider.name, result, error: null };
    } catch (err) {
      logger.warn(`[ai] calendar ${provider.name} failed: ${err.message}`);
    }
  }
  return { success: false, provider: null, result: null, error: 'All AI providers failed for calendar.' };
}

function mockCalendar(title, days, platforms) {
  const formats = ['Reel', 'Carousel', 'Post', 'Story'];
  const hooks = ['Stop doing this...', 'Nobody tells you...', 'I wasted 3 years...', 'The truth about...', 'Top 5 tips for...'];
  const topics = ['Introduction', 'Common mistakes', 'Quick wins', 'Behind the scenes', 'Q&A', 'Case study', 'Tutorial', 'Motivation'];
  const times = ['8-10 AM', '12-2 PM', '7-9 PM'];
  const days_arr = [];
  for (let i = 1; i <= days; i++) {
    days_arr.push({
      day: i,
      date: `Day ${i}`,
      platform: platforms[i % platforms.length],
      topic: `${topics[i % topics.length]} — ${title}`,
      hook: hooks[i % hooks.length],
      format: formats[i % formats.length],
      bestTime: times[i % times.length],
      notes: 'Mock entry — connect real AI for actual content plan.',
    });
  }
  return { days: days_arr };
}

/**
 * v2: Campaign Builder — generate N themed posts at once.
 */
async function generateCampaign({ title, theme, platforms, postCount = 10 }) {
  const targetPlatforms = platforms && platforms.length ? platforms : ['Instagram', 'Facebook', 'WhatsApp', 'LinkedIn'];
  const prompt = `You are a marketing strategist. Create a complete content campaign.

Campaign title: ${title}
Campaign theme: ${theme}
Target platforms: ${targetPlatforms.join(', ')}
Number of posts: ${postCount}

Return strict JSON: { "campaignTitle": "...", "campaignSummary": "1-paragraph overview", "posts": [{ "index": 1, "platform": "Instagram", "type": "Awareness/Engagement/Conversion", "headline": "post headline", "caption": "full caption", "hashtags": ["#..."], "cta": "call to action", "bestTime": "best posting time" }] }

Rules:
- Exactly ${postCount} posts
- Distribute across the target platforms (roughly equal)
- Mix post types: ~40% Awareness, ~30% Engagement, ~30% Conversion
- Each caption should be 50-150 words
- CTAs should vary (DM, Comment, Link in bio, etc.)
- Hashtags: 3-5 per post, relevant to theme`;

  const chain = buildChain();
  for (const provider of chain) {
    try {
      if (provider.name === 'mock') {
        return { success: true, provider: 'mock', result: mockCampaign(title, theme, postCount, targetPlatforms), error: null };
      }
      const result = await withRetry(async () => {
        if (provider.name === 'openai') {
          const resp = await callWithTimeout(
            () => fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
              body: JSON.stringify({
                model: env.OPENAI_MODEL,
                messages: [
                  { role: 'system', content: 'Return only valid JSON.' },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.7,
              }),
            }),
            env.AI_TIMEOUT_MS,
            'openai-campaign'
          );
          if (!resp.ok) throw new Error(`OpenAI campaign error ${resp.status}`);
          const json = await resp.json();
          return parsePotentialJson(json.choices?.[0]?.message?.content || '{}');
        }
        if (provider.name === 'gemini') {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
          const resp = await callWithTimeout(
            () => fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }),
            env.AI_TIMEOUT_MS,
            'gemini-campaign'
          );
          if (!resp.ok) throw new Error(`Gemini campaign error ${resp.status}`);
          const json = await resp.json();
          return parsePotentialJson(json.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
        }
        if (provider.name === 'groq') {
          return parsePotentialJson(await groqChatJson(prompt, 'groq-campaign'));
        }
        throw new Error('Provider not supported for campaign');
      }, env.AI_MAX_RETRIES, provider.name + '-campaign');
      return { success: true, provider: provider.name, result, error: null };
    } catch (err) {
      logger.warn(`[ai] campaign ${provider.name} failed: ${err.message}`);
    }
  }
  return { success: false, provider: null, result: null, error: 'All AI providers failed for campaign.' };
}

function mockCampaign(title, theme, count, platforms) {
  const types = ['Awareness', 'Engagement', 'Conversion'];
  const ctas = ['DM us', 'Comment below', 'Link in bio', 'Share with a friend', 'Save this post'];
  const posts = [];
  for (let i = 1; i <= count; i++) {
    posts.push({
      index: i,
      platform: platforms[i % platforms.length],
      type: types[i % types.length],
      headline: `${title} — Post ${i}`,
      caption: `[Mock] This is post ${i} of the "${title}" campaign about ${theme}. Replace with real AI output by configuring OPENAI_API_KEY.`,
      hashtags: ['#Campaign', '#' + title.replace(/\s/g, ''), '#IndianCreators'],
      cta: ctas[i % ctas.length],
      bestTime: '7-9 PM IST',
    });
  }
  return {
    campaignTitle: title,
    campaignSummary: `Mock campaign for ${theme}. Configure real AI provider to get actual content.`,
    posts,
  };
}

/**
 * v2: Brand Health Dashboard — analyze user's past generations + brand brain.
 */
async function analyzeBrandHealth({ generations, brandBrain, memories, schedules }) {
  const totalGens = generations.length;
  const totalSchedules = schedules.length;
  const last30 = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentGens = generations.filter((g) => new Date(g.createdAt).getTime() >= last30);

  // Calculate metrics from data we already have
  const platformsUsed = new Set(generations.map((g) => g.input?.platform).filter(Boolean));
  const tonesUsed = new Set();
  generations.forEach((g) => {
    if (g.input?.tone) tonesUsed.add(g.input.tone);
    memories.filter((m) => m.key === 'tone').forEach((m) => tonesUsed.add(m.value));
  });

  // Consistency: how often user posts (1+ per week = good)
  const consistencyScore = Math.min(100, Math.round((recentGens.length / 4) * 100));
  // Tone consistency: lower variety = more consistent
  const toneScore = tonesUsed.size <= 3 ? 90 : tonesUsed.size <= 5 ? 70 : 50;
  // Frequency: recent activity
  const frequencyScore = Math.min(100, recentGens.length * 10);
  // Engagement prediction: based on score averages
  const scored = generations.filter((g) => g.result?.score?.total);
  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((sum, g) => sum + g.result.score.total, 0) / scored.length)
    : 70;
  const engagementPrediction = avgScore;
  const totalScore = Math.round((consistencyScore + toneScore + frequencyScore + engagementPrediction) / 4);

  // AI insights (if provider available)
  let insights = {
    strengths: [],
    weaknesses: [],
    recommendations: [],
  };

  if (totalGens > 0) {
    const summary = `User has ${totalGens} total generations, ${recentGens.length} in last 30 days, ${totalSchedules} scheduled posts. Uses ${platformsUsed.size} platforms, ${tonesUsed.size} tones. Brand brain: ${brandBrain ? 'configured' : 'not configured'}.`;

    const prompt = `You are a brand health analyst. Based on this user's content activity, give brief insights.

Activity summary: ${summary}
Average content score: ${avgScore}/100
Tone variety: ${tonesUsed.size} different tones

Return strict JSON: {
  "strengths": ["2-3 short bullets about what they're doing well"],
  "weaknesses": ["2-3 short bullets about what needs improvement"],
  "recommendations": ["3-4 actionable next steps"]
}

Keep each bullet under 15 words.`;

    const chain = buildChain();
    for (const provider of chain) {
      try {
        if (provider.name === 'mock') {
          insights = mockInsights(brandBrain, recentGens.length, platformsUsed.size);
          break;
        }
        const result = await withRetry(async () => {
          if (provider.name === 'openai') {
            const resp = await callWithTimeout(
              () => fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
                body: JSON.stringify({
                  model: env.OPENAI_MODEL,
                  messages: [
                    { role: 'system', content: 'Return only valid JSON.' },
                    { role: 'user', content: prompt },
                  ],
                  temperature: 0.5,
                }),
              }),
              env.AI_TIMEOUT_MS,
              'openai-brand-health'
            );
            if (!resp.ok) throw new Error(`OpenAI brand health error ${resp.status}`);
            const json = await resp.json();
            return parsePotentialJson(json.choices?.[0]?.message?.content || '{}');
          }
          if (provider.name === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
            const resp = await callWithTimeout(
              () => fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
              }),
              env.AI_TIMEOUT_MS,
              'gemini-brand-health'
            );
            if (!resp.ok) throw new Error(`Gemini brand health error ${resp.status}`);
            const json = await resp.json();
            return parsePotentialJson(json.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
          }
          if (provider.name === 'groq') {
            return parsePotentialJson(await groqChatJson(prompt, 'groq-brand-health', 0.5));
          }
          throw new Error('Provider not supported');
        }, 1, provider.name + '-brand-health');
        insights = result;
        break;
      } catch (err) {
        logger.warn(`[ai] brand-health ${provider.name} failed: ${err.message}`);
      }
    }
  }

  return {
    success: true,
    provider: 'computed',
    result: {
      consistencyScore,
      toneScore,
      frequencyScore,
      engagementPrediction,
      totalScore,
      avgContentScore: avgScore,
      totalGenerations: totalGens,
      recentGenerations: recentGens.length,
      totalSchedules,
      platformsUsed: Array.from(platformsUsed),
      tonesUsed: Array.from(tonesUsed),
      brandBrainConfigured: !!brandBrain,
      insights,
    },
    error: null,
  };
}

function mockInsights(brandBrain, recentCount, platformCount) {
  return {
    strengths: [
      brandBrain ? 'Brand voice is configured — great consistency' : 'Active content creation',
      `Posted ${recentCount} times in last 30 days`,
      `Diversified across ${platformCount} platforms`,
    ],
    weaknesses: [
      !brandBrain ? 'No brand brain set — tone may drift' : 'Could post more consistently',
      'Limited scheduling — posts are created but not scheduled',
      'Connect real AI for personalized insights',
    ],
    recommendations: [
      brandBrain ? 'Keep posting 3+ times per week' : 'Set up Brand Brain to lock your voice',
      'Schedule posts in advance using the Planner',
      'Try the Repurposer to maximize each piece of content',
      'Aim for 5+ platforms to expand reach',
    ],
  };
}

/**
 * v2: Document-to-content — extract text from PDF and convert to social posts.
 */
async function documentToContent(extractedText, fileType, options = {}) {
  const platform = options.platform || 'Instagram';
  const niche = options.niche || 'general';
  const tone = options.tone || 'engaging';

  // Truncate to avoid token limits
  const truncated = extractedText.slice(0, 8000);

  const prompt = `Convert this document content into a ready-to-post social media package.

Source document type: ${fileType}
Target platform: ${platform}
Niche: ${niche}
Tone: ${tone}

Document content:
${truncated}

Return strict JSON: {
  "summary": "2-3 sentence summary of the document",
  "titles": ["5 catchy post titles"],
  "captions": ["2-3 full captions (50-150 words each)"],
  "hashtags": ["5-8 relevant hashtags"],
  "keywords": ["5-7 keywords"],
  "cta": "call to action",
  "carouselSlides": ["4-6 slide contents if platform supports carousel"],
  "threadTweets": ["4-6 tweets if target platform is X"]
}`;

  const chain = buildChain();
  for (const provider of chain) {
    try {
      if (provider.name === 'mock') {
        return {
          success: true,
          provider: 'mock',
          result: {
            summary: '[Mock] Document about ' + truncated.slice(0, 80) + '...',
            titles: ['[Mock] Title 1', '[Mock] Title 2', '[Mock] Title 3', '[Mock] Title 4', '[Mock] Title 5'],
            captions: ['[Mock] Caption based on document content...'],
            hashtags: ['#Document', '#Content', '#' + niche],
            keywords: [niche, 'document', 'content', 'social', 'post'],
            cta: 'Read the full document — link in bio.',
            carouselSlides: ['[Mock] Slide 1', '[Mock] Slide 2', '[Mock] Slide 3', '[Mock] Slide 4'],
            threadTweets: ['[Mock] Tweet 1', '[Mock] Tweet 2', '[Mock] Tweet 3'],
          },
          error: null,
        };
      }
      const result = await withRetry(async () => {
        if (provider.name === 'openai') {
          const resp = await callWithTimeout(
            () => fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
              body: JSON.stringify({
                model: env.OPENAI_MODEL,
                messages: [
                  { role: 'system', content: 'Return only valid JSON.' },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.7,
              }),
            }),
            env.AI_TIMEOUT_MS,
            'openai-document'
          );
          if (!resp.ok) throw new Error(`OpenAI document error ${resp.status}`);
          const json = await resp.json();
          return parsePotentialJson(json.choices?.[0]?.message?.content || '{}');
        }
        if (provider.name === 'gemini') {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
          const resp = await callWithTimeout(
            () => fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }),
            env.AI_TIMEOUT_MS,
            'gemini-document'
          );
          if (!resp.ok) throw new Error(`Gemini document error ${resp.status}`);
          const json = await resp.json();
          return parsePotentialJson(json.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
        }
        if (provider.name === 'groq') {
          return parsePotentialJson(await groqChatJson(prompt, 'groq-document'));
        }
        throw new Error('Provider not supported for document');
      }, env.AI_MAX_RETRIES, provider.name + '-document');
      return { success: true, provider: provider.name, result, error: null };
    } catch (err) {
      logger.warn(`[ai] document ${provider.name} failed: ${err.message}`);
    }
  }
  return { success: false, provider: null, result: null, error: 'All AI providers failed for document.' };
}

module.exports = { generateContent, scoreContent, repurposeContent, analyzeImage, generateCalendar, generateCampaign, analyzeBrandHealth, documentToContent, healthCheck, buildChain };
