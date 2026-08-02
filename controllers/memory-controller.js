/**
 * controllers/memory-controller.js (Module 3)
 * List / delete AI memories.
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const {
  getMemories,
  deleteMemory,
  clearMemories,
} = require('../services/storage-service');

async function list(req, res) {
  const memories = await getMemories(req.user.id);
  return res.status(200).json({ success: true, memories });
}

async function remove(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'Memory id required.' });
  await deleteMemory(req.user.id, id);
  return res.status(200).json({ success: true });
}

async function clear(req, res) {
  await clearMemories(req.user.id);
  return res.status(200).json({ success: true });
}

module.exports = {
  list: asyncHandler(list),
  remove: asyncHandler(remove),
  clear: asyncHandler(clear),
};
