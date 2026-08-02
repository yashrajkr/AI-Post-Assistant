/**
 * controllers/api-keys-controller.js (Chrome Extension auth)
 * Generate, list, revoke API keys.
 *
 * SECURITY:
 * - Raw key is returned ONCE on creation (never stored, never retrievable)
 * - DB stores only SHA-256 hash of the key
 * - key_prefix (first 12 chars) is shown in dashboard for identification
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const {
  createApiKeyRecord,
  listApiKeyRecords,
  revokeApiKey,
} = require('../services/storage-service');

async function list(req, res) {
  const keys = await listApiKeyRecords(req.user.id);
  return res.status(200).json({ success: true, apiKeys: keys });
}

async function create(req, res) {
  // Limit: max 5 API keys per user (prevent abuse)
  const existing = await listApiKeyRecords(req.user.id);
  if (existing.length >= 5) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 5 API keys allowed. Revoke an existing key first.',
    });
  }

  const record = await createApiKeyRecord(req.user.id, req.body.name || 'default');

  return res.status(201).json({
    success: true,
    apiKey: {
      id: record.id,
      keyPrefix: record.keyPrefix,
      name: record.name,
      createdAt: record.createdAt,
    },
    // ⚠️ rawKey is shown ONCE. User must copy and save it securely.
    rawKey: record.rawKey,
    message: 'Copy this key now. You will not be able to see it again.',
  });
}

async function revoke(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'Key id required.' });
  await revokeApiKey(req.user.id, id);
  return res.status(200).json({ success: true });
}

module.exports = {
  list: asyncHandler(list),
  create: asyncHandler(create),
  revoke: asyncHandler(revoke),
};
