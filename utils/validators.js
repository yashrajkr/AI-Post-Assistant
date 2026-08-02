/**
 * utils/validators.js
 * Zod schemas for every API request body.
 * Used by middleware/validate.js to reject bad input before it reaches controllers.
 */

const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().min(2).max(100).optional().default('Creator'),
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  brandName: z.string().max(100).optional(),
  tagline: z.string().max(200).optional(),
  tone: z.string().max(100).optional(),
});

const upgradeSchema = z.object({
  plan: z.enum(['free', 'creator', 'business', 'agency']),
});

const generateSchema = z.object({
  content: z.string().min(1).max(5000),
  platform: z.string().min(1).max(50),
  niche: z.string().min(1).max(50),
  language: z.string().min(1).max(50),
  goal: z.string().min(1).max(50),
  tone: z.string().min(1).max(50),
  template: z.string().max(50).optional().default('general'),
  audience: z.string().max(200).optional().default(''),
  location: z.string().max(200).optional().default(''),
});

const feedbackSchema = z.object({
  rating: z.string().max(50).optional().default('useful'),
  comment: z.string().max(2000).optional().default(''),
  generationId: z.string().max(100).optional().nullable().default(null),
});

const scheduleSchema = z.object({
  platform: z.string().min(1).max(50),
  content: z.string().min(1).max(5000),
  dateTime: z.string().min(1).max(50),
});

const createOrderSchema = z.object({
  plan: z.enum(['creator', 'business', 'agency']),
});

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1).max(200),
  paymentId: z.string().min(1).max(200),
  signature: z.string().max(500).optional().default(''),
});

// ---------- Module 1: AI Brand Brain ----------
const brandBrainSchema = z.object({
  brandName: z.string().max(100).optional().default(''),
  tagline: z.string().max(200).optional().default(''),
  niche: z.string().max(200).optional().default(''),
  audience: z.string().max(500).optional().default(''),
  tones: z.array(z.string().max(50)).max(10).optional().default([]),
  ctaStyle: z.enum(['direct', 'soft', 'question', 'none']).optional().default('direct'),
  bannedWords: z.array(z.string().max(50)).max(50).optional().default([]),
});

// ---------- Module 2: AI Content Score ----------
const scoreSchema = z.object({
  content: z.string().min(1).max(5000),
  platform: z.string().min(1).max(50).optional().default('Instagram'),
  niche: z.string().max(50).optional().default(''),
  cta: z.string().max(500).optional().default(''),
  hashtags: z.array(z.string().max(50)).max(20).optional().default([]),
});

// ---------- Module 3: AI Memory ----------
// (No body needed for GET / DELETE; just params)

// ---------- Module 4: Prompt Library ----------
const createPromptSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(300).optional().default(''),
  body: z.string().min(1).max(5000),
  category: z.string().max(50).optional().default('general'),
  isPublic: z.boolean().optional().default(false),
});

const updatePromptSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional(),
  body: z.string().min(1).max(5000).optional(),
  category: z.string().max(50).optional(),
  isPublic: z.boolean().optional(),
});

const ratePromptSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

// ---------- Module 5: Image Analysis ----------
// multipart/form-data — validated in controller, not Zod
// (Zod can't easily validate File objects)

// ---------- Module 6: AI Repurposer ----------
const repurposeSchema = z.object({
  sourceContent: z.string().min(1).max(10000),
  sourceType: z.enum(['youtube', 'blog', 'idea', 'text']).optional().default('text'),
  platforms: z.array(z.string().max(50)).max(6).optional(),
});

// ---------- v2: AI Content Calendar ----------
const calendarSchema = z.object({
  title: z.string().min(1).max(200),
  niche: z.string().max(100).optional().default('general'),
  durationDays: z.number().int().min(7).max(90).optional().default(30),
  platforms: z.array(z.string().max(50)).max(6).optional(),
});

// ---------- v2: Campaign Builder ----------
const campaignSchema = z.object({
  title: z.string().min(1).max(200),
  theme: z.string().min(1).max(500),
  platforms: z.array(z.string().max(50)).max(6).optional(),
  postCount: z.number().int().min(3).max(30).optional().default(10),
});

// ---------- v2: Brand Health ----------
const brandHealthSchema = z.object({
  forceRefresh: z.boolean().optional().default(false),
});

// ---------- Chrome Extension: API Keys ----------
const createApiKeySchema = z.object({
  name: z.string().min(1).max(50).optional().default('default'),
});

module.exports = {
  signupSchema,
  loginSchema,
  profileSchema,
  upgradeSchema,
  generateSchema,
  feedbackSchema,
  scheduleSchema,
  createOrderSchema,
  verifyPaymentSchema,
  brandBrainSchema,
  scoreSchema,
  createPromptSchema,
  updatePromptSchema,
  ratePromptSchema,
  repurposeSchema,
  calendarSchema,
  campaignSchema,
  brandHealthSchema,
  createApiKeySchema,
};
