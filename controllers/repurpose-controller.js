/**
 * controllers/repurpose-controller.js (Module 6)
 * One input → 6 platform-optimized outputs.
 * Costs 3 credits (it's 6 generations in one).
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const { repurposeContent } = require('../services/ai-service');
const { decrementCredits, saveGeneration } = require('../services/storage-service');
const { publicUser } = require('../utils/helpers');
const crypto = require('crypto');

async function repurpose(req, res) {
  const { sourceContent, sourceType, platforms } = req.body;

  // Costs 3 credits
  if (Number(req.user.credits || 0) < 3) {
    return res.status(402).json({
      success: false,
      message: 'Repurposing costs 3 credits. You have ' + req.user.credits + '.',
    });
  }

  const result = await repurposeContent({ sourceContent, sourceType, platforms });

  if (!result.success) {
    return res.status(503).json({
      success: false,
      message: 'Repurposing failed. Please try again.',
    });
  }

  // Decrement 3 credits
  let updatedUser = req.user;
  for (let i = 0; i < 3; i++) {
    try {
      updatedUser = await decrementCredits(req.user.id);
    } catch (err) {
      break;
    }
  }

  // Save each platform output as a generation record
  const generations = [];
  if (result.results && typeof result.results === 'object') {
    for (const [platform, content] of Object.entries(result.results)) {
      const gen = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        input: {
          content: sourceContent,
          platform,
          niche: 'repurposed',
          language: 'English',
          goal: 'Repurpose',
          tone: 'platform-optimized',
          template: 'repurpose',
          sourceType: sourceType || 'text',
        },
        result: content,
        provider: result.provider,
      };
      generations.push(gen);
      await saveGeneration({ userId: req.user.id, generation: gen }).catch(() => {});
    }
  }

  return res.status(200).json({
    success: true,
    results: result.results,
    generations,
    user: publicUser(updatedUser),
    provider: result.provider,
    usedFallback: result.provider === 'mock' && process.env.AI_PROVIDER !== 'mock',
  });
}

module.exports = { repurpose: asyncHandler(repurpose) };
