/**
 * controllers/feedback-controller.js
 */

const crypto = require('crypto');
const { saveFeedback } = require('../services/storage-service');

async function submitFeedback(req, res) {
  const feedback = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    rating: req.body.rating || 'useful',
    comment: String(req.body.comment || ''),
    generationId: req.body.generationId || null,
    createdAt: new Date().toISOString(),
  };
  await saveFeedback({ userId: req.user.id, feedback });
  return res.status(201).json({ success: true });
}

module.exports = { submitFeedback };
