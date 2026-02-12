import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { verificationService } from '../services/verificationService';
import { imageProcessor } from '../services/imageProcessor';
import {
  VerificationRequest,
  VerificationResponse,
  BatchVerificationRequest,
  BatchVerificationResponse,
} from '../types';

const router = Router();

/**
 * POST /api/verify-label
 * Verify a single label
 */
router.post('/verify-label', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { image, expected } = req.body as VerificationRequest;

    // Validate request
    if (!image || !expected) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: image and expected values',
      });
    }

    // Validate image format
    if (!imageProcessor.isValidFormat(image)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Supported: JPEG, PNG, WEBP',
      });
    }

    // Process image
    const processedImage = await imageProcessor.processImage(image);

    // Extract label information using AI
    const extracted = await aiService.extractLabelInfo(processedImage);

    // Verify against expected values
    const verification = verificationService.verify(extracted, expected);

    // Get mismatches
    const mismatches = verificationService.getMismatches(verification);

    // Check overall pass/fail
    const overallPass = verificationService.isOverallPass(verification);

    const processingTime = (Date.now() - startTime) / 1000;

    const response: VerificationResponse = {
      success: true,
      overallPass,
      processingTimeSeconds: parseFloat(processingTime.toFixed(2)),
      extracted,
      verification,
      mismatches,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in verify-label:', error);

    const processingTime = (Date.now() - startTime) / 1000;

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      processingTimeSeconds: parseFloat(processingTime.toFixed(2)),
    });
  }
});

/**
 * POST /api/verify-batch
 * Verify multiple labels
 */
router.post('/verify-batch', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { images, expectedValues } = req.body as BatchVerificationRequest;

    // Validate request
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid images array',
      });
    }

    if (!expectedValues || !Array.isArray(expectedValues)) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid expectedValues array',
      });
    }

    if (images.length !== expectedValues.length) {
      return res.status(400).json({
        success: false,
        error: 'Number of images must match number of expected values',
      });
    }

    if (images.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 images per batch',
      });
    }

    // Process each label
    const results: VerificationResponse[] = [];
    let passedCount = 0;
    let failedCount = 0;

    // Process in parallel with concurrency limit
    const CONCURRENCY = 5;
    const chunks: number[][] = [];

    for (let i = 0; i < images.length; i += CONCURRENCY) {
      chunks.push(Array.from({ length: Math.min(CONCURRENCY, images.length - i) }, (_, j) => i + j));
    }

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (index) => {
          const itemStartTime = Date.now();

          try {
            const processedImage = await imageProcessor.processImage(images[index]);
            const extracted = await aiService.extractLabelInfo(processedImage);
            const verification = verificationService.verify(extracted, expectedValues[index]);
            const mismatches = verificationService.getMismatches(verification);
            const overallPass = verificationService.isOverallPass(verification);

            if (overallPass) {
              passedCount++;
            } else {
              failedCount++;
            }

            const itemProcessingTime = (Date.now() - itemStartTime) / 1000;

            return {
              success: true,
              overallPass,
              processingTimeSeconds: parseFloat(itemProcessingTime.toFixed(2)),
              extracted,
              verification,
              mismatches,
            } as VerificationResponse;
          } catch (error) {
            failedCount++;
            const itemProcessingTime = (Date.now() - itemStartTime) / 1000;

            return {
              success: false,
              overallPass: false,
              processingTimeSeconds: parseFloat(itemProcessingTime.toFixed(2)),
              error: error instanceof Error ? error.message : 'Processing failed',
              extracted: {
                brandName: 'ERROR',
                classType: 'ERROR',
                alcoholContent: 'ERROR',
                netContents: 'ERROR',
                governmentWarning: 'ERROR',
              },
              verification: {
                brandName: { match: false, confidence: 0 },
                classType: { match: false, confidence: 0 },
                alcoholContent: { match: false, confidence: 0 },
                netContents: { match: false, confidence: 0 },
                governmentWarning: { match: false, confidence: 0 },
              },
              mismatches: ['Error processing image'],
            } as VerificationResponse;
          }
        })
      );

      results.push(...chunkResults);
    }

    const totalProcessingTime = (Date.now() - startTime) / 1000;

    const response: BatchVerificationResponse = {
      success: true,
      summary: {
        total: images.length,
        passed: passedCount,
        failed: failedCount,
      },
      results,
      processingTimeSeconds: parseFloat(totalProcessingTime.toFixed(2)),
    };

    res.json(response);
  } catch (error) {
    console.error('Error in verify-batch:', error);

    const processingTime = (Date.now() - startTime) / 1000;

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      processingTimeSeconds: parseFloat(processingTime.toFixed(2)),
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY,
  });
});

export default router;
