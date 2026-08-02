/**
 * controllers/schedule-controller.js
 * Create + list scheduled posts.
 */

const crypto = require('crypto');
const { createSchedule, getSchedules } = require('../services/storage-service');

async function createScheduleItem(req, res) {
  const item = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    platform: req.body.platform,
    content: req.body.content,
    dateTime: req.body.dateTime,
    status: 'planned',
    createdAt: new Date().toISOString(),
  };
  const saved = await createSchedule({ userId: req.user.id, item });
  return res.status(201).json({ success: true, schedule: saved });
}

async function listSchedules(req, res) {
  const schedules = await getSchedules({ userId: req.user.id });
  return res.status(200).json({ success: true, schedules });
}

module.exports = { createScheduleItem, listSchedules };
