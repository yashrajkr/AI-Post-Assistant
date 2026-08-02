/**
 * controllers/analytics-controller.js
 * Returns aggregated usage stats for the logged-in user.
 */

const { getSchedules, getGenerations } = require('../services/storage-service');
const { mostCommon } = require('../utils/helpers');

async function getAnalytics(req, res) {
  const generations = await getGenerations({ userId: req.user.id });
  const schedules = await getSchedules({ userId: req.user.id });

  const last30 = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const inLast30 = (d) => new Date(d).getTime() >= last30;

  return res.status(200).json({
    success: true,
    analytics: {
      credits: req.user.credits,
      plan: req.user.plan,
      totalGenerations: generations.length,
      totalSchedules: schedules.length,
      last30DaysGenerations: generations.filter((g) => inLast30(g.createdAt)).length,
      last30DaysSchedules: schedules.filter((s) => inLast30(s.createdAt)).length,
      mostUsedPlatform: mostCommon(generations.map((g) => g.input?.platform)),
      mostUsedNiche: mostCommon(generations.map((g) => g.input?.niche)),
    },
  });
}

module.exports = { getAnalytics };
