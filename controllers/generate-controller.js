/**
 * controllers/generate-controller.js
 * AI content generation + history.
 * Updated for Prompt 3: brand brain injection, AI memory, multi-platform, score.
 */

const crypto = require('crypto');
const { asyncHandler } = require('../middleware/asyncHandler');
const { publicUser } = require('../utils/helpers');
const { generateContent } = require('../services/ai-service');
const {
  saveGeneration,
  getGenerations,
  decrementCredits,
  getBrandBrain,
  getMemories,
  recordMemory,
} = require('../services/storage-service');

async function generate(req, res) {
  const input = {
    content: req.body.content,
    platform: req.body.platform,
    niche: req.body.niche,
    language: req.body.language,
    goal: req.body.goal,
    tone: req.body.tone,
    template: req.body.template,
    audience: req.body.audience,
    location: req.body.location,
  };

  // Multi-platform support (Module 7): if req.body.platforms (array) is sent,
  // generate for each platform separately. Otherwise single-platform.
  const platforms = Array.isArray(req.body.platforms) ? req.body.platforms : null;

  // Load brand brain (Module 1) + AI memory (Module 3) for prompt enrichment
  const [brandBrain, memories] = await Promise.all([
    getBrandBrain(req.user.id).catch(() => null),
    getMemories(req.user.id).catch(() => []),
  ]);

  if (platforms && platforms.length > 1) {
    // Multi-platform path: decrement N credits upfront, then generate for each
    const creditCount = platforms.length;
    if (Number(req.user.credits || 0) < creditCount) {
      return res.status(402).json({
        success: false,
        message: `You need ${creditCount} credits for ${creditCount} platforms. You have ${req.user.credits}.`,
      });
    }

    const results = {};
    const generations = [];
    let primaryProvider = 'mock';
    let anyFallback = false;

    for (const platform of platforms) {
      const platformInput = { ...input, platform };
      const r = await generateContent(platformInput, req.user, {
        brandBrain,
        memory: memories,
        withScore: true,
      });
      if (r.success) {
        results[platform] = r.content;
        if (r.provider !== 'mock') primaryProvider = r.provider;
        if (r.provider === 'mock' && process.env.AI_PROVIDER !== 'mock') anyFallback = true;

        const generation = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          input: platformInput,
          result: r.content,
          provider: r.provider,
        };
        generations.push(generation);

        // Record memories (Module 3)
        await recordMemorySafe(req.user.id, 'platform', platform);
        if (r.content?.titles?.[0]) await recordMemorySafe(req.user.id, 'title', r.content.titles[0]);
        if (r.content?.hashtags) {
          for (const tag of r.content.hashtags.slice(0, 3)) {
            await recordMemorySafe(req.user.id, 'hashtag', tag);
          }
        }
        await recordMemorySafe(req.user.id, 'tone', input.tone);
        await recordMemorySafe(req.user.id, 'niche', input.niche);
      } else {
        results[platform] = { error: 'Generation failed for this platform.' };
      }
    }

    // Decrement N credits
    let updatedUser = req.user;
    for (let i = 0; i < creditCount; i++) {
      try {
        updatedUser = await decrementCredits(req.user.id);
      } catch (err) {
        break;
      }
    }

    // Save all generations
    for (const gen of generations) {
      await saveGeneration({ userId: req.user.id, generation: gen }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      results,
      generations,
      user: publicUser(updatedUser),
      provider: primaryProvider,
      usedFallback: anyFallback,
      multiPlatform: true,
    });
  }

  // Single-platform path (original behavior, backward compatible)
  const result = await generateContent(input, req.user, {
    brandBrain,
    memory: memories,
    withScore: true,
  });

  if (!result.success) {
    return res.status(503).json({
      success: false,
      message: 'Our AI service is temporarily unavailable. Please try again in a moment.',
    });
  }

  const generation = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    input,
    result: result.content,
    provider: result.provider,
  };

  const updatedUser = await decrementCredits(req.user.id);
  await saveGeneration({ userId: req.user.id, generation });

  // Record memories (Module 3) — fire-and-forget, don't block response
  await recordMemorySafe(req.user.id, 'platform', input.platform);
  await recordMemorySafe(req.user.id, 'niche', input.niche);
  await recordMemorySafe(req.user.id, 'tone', input.tone);
  if (result.content?.titles?.[0]) {
    await recordMemorySafe(req.user.id, 'title', result.content.titles[0]);
  }
  if (Array.isArray(result.content?.hashtags)) {
    for (const tag of result.content.hashtags.slice(0, 3)) {
      await recordMemorySafe(req.user.id, 'hashtag', tag);
    }
  }
  if (input.audience) await recordMemorySafe(req.user.id, 'audience', input.audience);
  if (input.location) await recordMemorySafe(req.user.id, 'location', input.location);

  return res.status(200).json({
    success: true,
    generation,
    user: publicUser(updatedUser),
    provider: result.provider,
    usedFallback: result.provider === 'mock' && process.env.AI_PROVIDER !== 'mock',
  });
}

async function recordMemorySafe(userId, key, value) {
  try {
    await recordMemory(userId, key, value);
  } catch {
    /* don't let memory failure break generation */
  }
}

async function history(req, res) {
  const generations = await getGenerations({ userId: req.user.id });
  return res.status(200).json({ success: true, generations });
}

module.exports = { generate, history };
