/**
 * controllers/brand-health-controller.js (v2: Brand Health Dashboard)
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const { analyzeBrandHealth } = require('../services/ai-service');
const { saveBrandHealth, getLatestBrandHealth } = require('../services/storage-service');
const {
  getGenerations,
  getSchedules,
  getBrandBrain,
  getMemories,
} = require('../services/storage-service');

async function get(req, res) {
  const forceRefresh = req.query.refresh === 'true' || req.body?.forceRefresh === true;

  // Try to return cached snapshot first (unless force-refresh)
  if (!forceRefresh) {
    const cached = await getLatestBrandHealth(req.user.id).catch(() => null);
    if (cached && Date.now() - new Date(cached.createdAt).getTime() < 60 * 60 * 1000) {
      // Cache is less than 1 hour old — return it
      return res.status(200).json({ success: true, health: cached, cached: true });
    }
  }

  // Load all user data for analysis
  const [generations, schedules, brandBrain, memories] = await Promise.all([
    getGenerations({ userId: req.user.id }).catch(() => []),
    getSchedules({ userId: req.user.id }).catch(() => []),
    getBrandBrain(req.user.id).catch(() => null),
    getMemories(req.user.id).catch(() => []),
  ]);

  const result = await analyzeBrandHealth({
    generations,
    schedules,
    brandBrain,
    memories,
  });

  if (!result.success) {
    return res.status(503).json({ success: false, message: 'Brand health analysis failed.' });
  }

  // Save snapshot
  const saved = await saveBrandHealth(req.user.id, result.result);

  return res.status(200).json({
    success: true,
    health: saved,
    cached: false,
  });
}

module.exports = { get: asyncHandler(get) };
