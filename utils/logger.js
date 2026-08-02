/**
 * utils/logger.js
 * Tiny structured logger. Replace with winston/pino if you need transports.
 */

const { env } = require('../config/env');

function ts() {
  return new Date().toISOString();
}

function fmt(level, msg, meta) {
  const base = `[${ts()}] [${level.toUpperCase()}] ${msg}`;
  if (meta && Object.keys(meta).length) {
    return `${base} ${JSON.stringify(meta)}`;
  }
  return base;
}

module.exports = {
  info: (msg, meta = {}) => console.log(fmt('info', msg, meta)),
  warn: (msg, meta = {}) => console.warn(fmt('warn', msg, meta)),
  error: (msg, meta = {}) => console.error(fmt('error', msg, meta)),
  debug: (msg, meta = {}) => {
    if (env.isDevelopment) console.log(fmt('debug', msg, meta));
  },
};
