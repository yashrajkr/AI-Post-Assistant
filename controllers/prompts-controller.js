/**
 * controllers/prompts-controller.js (Module 4)
 * CRUD + use + rate for prompt library.
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const {
  listPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  incrementPromptUses,
  ratePrompt,
} = require('../services/storage-service');

async function list(req, res) {
  const { category, mine } = req.query;
  const includePublic = mine !== 'true';
  const prompts = await listPrompts(req.user.id, {
    category: category || 'all',
    includePublic,
  });
  return res.status(200).json({ success: true, prompts });
}

async function getOne(req, res) {
  const p = await getPrompt(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Prompt not found.' });
  // Privacy check: if not public, only owner can view
  if (!p.isPublic && p.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not allowed.' });
  }
  return res.status(200).json({ success: true, prompt: p });
}

async function create(req, res) {
  const p = await createPrompt(req.user.id, req.body);
  return res.status(201).json({ success: true, prompt: p });
}

async function update(req, res) {
  try {
    const p = await updatePrompt(req.user.id, req.params.id, req.body);
    return res.status(200).json({ success: true, prompt: p });
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message });
  }
}

async function remove(req, res) {
  await deletePrompt(req.user.id, req.params.id);
  return res.status(200).json({ success: true });
}

async function use(req, res) {
  const p = await getPrompt(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Prompt not found.' });
  if (!p.isPublic && p.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not allowed.' });
  }
  await incrementPromptUses(req.params.id).catch(() => {});
  return res.status(200).json({ success: true, prompt: p });
}

async function rate(req, res) {
  try {
    const result = await ratePrompt(req.params.id, req.body.rating);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message });
  }
}

module.exports = {
  list: asyncHandler(list),
  getOne: asyncHandler(getOne),
  create: asyncHandler(create),
  update: asyncHandler(update),
  remove: asyncHandler(remove),
  use: asyncHandler(use),
  rate: asyncHandler(rate),
};
