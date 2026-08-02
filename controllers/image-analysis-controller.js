/**
 * controllers/image-analysis-controller.js (Module 5)
 * Upload an image, AI analyzes it, returns caption + hashtags + alt text + CTA.
 *
 * Uses multer for multipart/form-data parsing. Falls back to base64 JSON if
 * multer is not installed (so the endpoint still works in dev).
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const { analyzeImage } = require('../services/ai-service');
const { saveImageAnalysis } = require('../services/storage-service');
const { decrementCredits } = require('../services/storage-service');
const { publicUser } = require('../utils/helpers');

let multer;
try {
  multer = require('multer');
} catch {
  multer = null;
}

const upload = multer
  ? multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new Error('Only PNG, JPG, WEBP allowed (max 5MB).'));
        }
        cb(null, true);
      },
    }).single('image')
  : null;

async function analyze(req, res) {
  // If multer is available, file is in req.file. Otherwise expect base64 in body.
  let imageBuffer;
  let mimeType;
  let imageUrl;

  if (req.file) {
    imageBuffer = req.file.buffer;
    mimeType = req.file.mimetype;
    imageUrl = `data:${mimeType};base64,${imageBuffer.toString('base64').slice(0, 100)}...`;
  } else if (req.body.imageBase64) {
    // Accept base64 string in JSON body as fallback
    const matches = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(req.body.imageBase64);
    if (!matches) {
      return res.status(400).json({ success: false, message: 'Invalid imageBase64 format.' });
    }
    mimeType = matches[1];
    imageBuffer = Buffer.from(matches[2], 'base64');
    if (imageBuffer.length > 5 * 1024 * 1024) {
      return res.status(413).json({ success: false, message: 'Image too large (max 5MB).' });
    }
    imageUrl = req.body.imageBase64.slice(0, 100) + '...';
  } else {
    return res.status(400).json({ success: false, message: 'No image provided. Send multipart/form-data with "image" field, or JSON with "imageBase64".' });
  }

  // Check credits (image analysis costs 1 credit)
  if (Number(req.user.credits || 0) < 1) {
    return res.status(402).json({ success: false, message: 'No credits left. Upgrade your plan.' });
  }

  const result = await analyzeImage(imageBuffer, mimeType, {
    platform: req.body.platform || 'Instagram',
    niche: req.body.niche || 'general',
    tone: req.body.tone || 'engaging',
  });

  if (!result.success) {
    return res.status(503).json({ success: false, message: 'Image analysis failed. Try again.' });
  }

  // Save to image_analyses table (don't store the full base64 in DB)
  const saved = await saveImageAnalysis(req.user.id, imageUrl, result.result, result.provider);

  // Decrement credits
  const updatedUser = await decrementCredits(req.user.id);

  return res.status(200).json({
    success: true,
    analysis: {
      id: saved.id,
      createdAt: saved.createdAt,
      result: result.result,
      provider: result.provider,
    },
    user: publicUser(updatedUser),
    usedFallback: result.provider === 'mock' && process.env.AI_PROVIDER !== 'mock',
  });
}

// Wrap with multer if available, otherwise just pass-through
const uploadMiddleware = upload
  ? (req, res, next) => {
      upload(req, res, (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }
        next();
      });
    }
  : (req, res, next) => next();

module.exports = {
  analyze: uploadMiddleware,
  handleAnalyze: asyncHandler(analyze),
};
