/**
 * controllers/score-controller.js (Module 2)
 * Re-scores existing content without regenerating.
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const { scoreContent } = require('../services/ai-service');

async function score(req, res) {
  const result = await scoreContent({
    content: req.body.content,
    platform: req.body.platform,
    niche: req.body.niche,
    cta: req.body.cta,
    hashtags: req.body.hashtags,
  });

  if (!result.success) {
    return res.status(503).json({
      success: false,
      message: 'AI scoring is temporarily unavailable.',
    });
  }

  return res.status(200).json({
    success: true,
    score: result.score,
    provider: result.provider,
  });
}

module.exports = { score: asyncHandler(score) };
