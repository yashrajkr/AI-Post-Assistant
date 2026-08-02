/**
 * controllers/document-controller.js (v2: Document-to-content)
 * Upload a PDF, extract text, convert to social posts.
 * Also supports plain text paste (no upload required).
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const { documentToContent } = require('../services/ai-service');
const { saveDocumentAnalysis } = require('../services/storage-service');
const { decrementCredits } = require('../services/storage-service');
const { publicUser } = require('../utils/helpers');

let multer;
try { multer = require('multer'); } catch { multer = null; }

const upload = multer
  ? multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'text/plain', 'text/markdown'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new Error('Only PDF, TXT, MD allowed (max 10MB).'));
        }
        cb(null, true);
      },
    }).single('document')
  : null;

async function analyze(req, res) {
  let extractedText = '';
  let filename = 'pasted-text.txt';
  let fileType = 'text/plain';

  if (req.file) {
    filename = req.file.originalname;
    fileType = req.file.mimetype;
    if (fileType === 'application/pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(req.file.buffer);
        extractedText = data.text || '';
      } catch (err) {
        return res.status(400).json({ success: false, message: 'PDF parsing failed: ' + err.message });
      }
    } else {
      extractedText = req.file.buffer.toString('utf-8');
    }
  } else if (req.body.text) {
    extractedText = req.body.text;
    if (req.body.filename) filename = req.body.filename;
  } else {
    return res.status(400).json({ success: false, message: 'No document provided. Upload a file or paste text.' });
  }

  if (!extractedText || extractedText.trim().length < 50) {
    return res.status(400).json({ success: false, message: 'Document too short or empty. Need at least 50 characters.' });
  }

  if (Number(req.user.credits || 0) < 2) {
    return res.status(402).json({ success: false, message: 'Document analysis costs 2 credits. You have ' + req.user.credits + '.' });
  }

  const result = await documentToContent(extractedText, fileType, {
    platform: req.body.platform,
    niche: req.body.niche,
    tone: req.body.tone,
  });

  if (!result.success) {
    return res.status(503).json({ success: false, message: 'Document analysis failed.' });
  }

  let updatedUser = req.user;
  for (let i = 0; i < 2; i++) {
    try { updatedUser = await decrementCredits(req.user.id); } catch { break; }
  }

  const analysis = {
    filename,
    fileType,
    extractedText: extractedText.slice(0, 5000),
    result: result.result,
    provider: result.provider,
  };
  const saved = await saveDocumentAnalysis(req.user.id, analysis);

  return res.status(200).json({
    success: true,
    analysis: saved,
    user: publicUser(updatedUser),
    usedFallback: result.provider === 'mock' && process.env.AI_PROVIDER !== 'mock',
  });
}

const uploadMiddleware = upload
  ? (req, res, next) => {
      upload(req, res, (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        next();
      });
    }
  : (req, res, next) => next();

module.exports = {
  upload: uploadMiddleware,
  analyze: asyncHandler(analyze),
};
