/**
 * controllers/brand-brain-controller.js (Module 1)
 * CRUD for the user's brand brain — their unique AI voice.
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const {
  getBrandBrain,
  upsertBrandBrain,
  deleteBrandBrain,
} = require('../services/storage-service');

async function get(req, res) {
  const bb = await getBrandBrain(req.user.id);
  return res.status(200).json({ success: true, brandBrain: bb });
}

async function upsert(req, res) {
  const saved = await upsertBrandBrain(req.user.id, req.body);
  return res.status(200).json({ success: true, brandBrain: saved });
}

async function remove(req, res) {
  await deleteBrandBrain(req.user.id);
  return res.status(200).json({ success: true });
}

module.exports = {
  get: asyncHandler(get),
  upsert: asyncHandler(upsert),
  remove: asyncHandler(remove),
};
