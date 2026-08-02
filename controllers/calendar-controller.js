/**
 * controllers/calendar-controller.js (v2: AI Content Calendar)
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const { generateCalendar } = require('../services/ai-service');
const { saveCalendar, getCalendars } = require('../services/storage-service');
const { publicUser } = require('../utils/helpers');
const { decrementCredits } = require('../services/storage-service');

async function create(req, res) {
  // Calendar generation costs 2 credits
  if (Number(req.user.credits || 0) < 2) {
    return res.status(402).json({
      success: false,
      message: 'Calendar generation costs 2 credits. You have ' + req.user.credits + '.',
    });
  }

  const result = await generateCalendar({
    title: req.body.title,
    niche: req.body.niche,
    durationDays: req.body.durationDays,
    platforms: req.body.platforms,
  });

  if (!result.success) {
    return res.status(503).json({ success: false, message: 'Calendar generation failed. Try again.' });
  }

  // Decrement 2 credits
  let updatedUser = req.user;
  for (let i = 0; i < 2; i++) {
    try { updatedUser = await decrementCredits(req.user.id); } catch { break; }
  }

  const calendar = {
    title: req.body.title,
    niche: req.body.niche,
    durationDays: req.body.durationDays,
    result: result.result,
    provider: result.provider,
  };
  const saved = await saveCalendar(req.user.id, calendar);

  return res.status(200).json({
    success: true,
    calendar: saved,
    user: publicUser(updatedUser),
    usedFallback: result.provider === 'mock' && process.env.AI_PROVIDER !== 'mock',
  });
}

async function list(req, res) {
  const calendars = await getCalendars(req.user.id);
  return res.status(200).json({ success: true, calendars });
}

module.exports = {
  create: asyncHandler(create),
  list: asyncHandler(list),
};
