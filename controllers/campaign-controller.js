/**
 * controllers/campaign-controller.js (v2: Campaign Builder)
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const { generateCampaign } = require('../services/ai-service');
const { saveCampaign, getCampaigns } = require('../services/storage-service');
const { decrementCredits } = require('../services/storage-service');
const { publicUser } = require('../utils/helpers');

async function create(req, res) {
  // Campaign generation costs 3 credits
  if (Number(req.user.credits || 0) < 3) {
    return res.status(402).json({
      success: false,
      message: 'Campaign generation costs 3 credits. You have ' + req.user.credits + '.',
    });
  }

  const result = await generateCampaign({
    title: req.body.title,
    theme: req.body.theme,
    platforms: req.body.platforms,
    postCount: req.body.postCount,
  });

  if (!result.success) {
    return res.status(503).json({ success: false, message: 'Campaign generation failed. Try again.' });
  }

  let updatedUser = req.user;
  for (let i = 0; i < 3; i++) {
    try { updatedUser = await decrementCredits(req.user.id); } catch { break; }
  }

  const campaign = {
    title: req.body.title,
    theme: req.body.theme,
    platforms: req.body.platforms || [],
    postCount: req.body.postCount,
    result: result.result,
    provider: result.provider,
  };
  const saved = await saveCampaign(req.user.id, campaign);

  return res.status(200).json({
    success: true,
    campaign: saved,
    user: publicUser(updatedUser),
    usedFallback: result.provider === 'mock' && process.env.AI_PROVIDER !== 'mock',
  });
}

async function list(req, res) {
  const campaigns = await getCampaigns(req.user.id);
  return res.status(200).json({ success: true, campaigns });
}

module.exports = {
  create: asyncHandler(create),
  list: asyncHandler(list),
};
