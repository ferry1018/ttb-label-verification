import sharp from 'sharp';

export class ImageProcessor {
  private readonly MAX_SIZE = 2048;
  private readonly MAX_FILE_SIZE_MB = 10;

  /**
   * Validate and preprocess image
   */
  async processImage(base64Image: string): Promise<string> {
    try {
      // Remove data URL prefix if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Check file size (10MB limit)
      const fileSizeMB = buffer.length / (1024 * 1024);
      if (fileSizeMB > this.MAX_FILE_SIZE_MB) {
        throw new Error(`Image too large: ${fileSizeMB.toFixed(2)}MB (max ${this.MAX_FILE_SIZE_MB}MB)`);
      }

      // Get image metadata
      const metadata = await sharp(buffer).metadata();

      // Check if image needs resizing
      const needsResize =
        metadata.width && metadata.height &&
        (metadata.width > this.MAX_SIZE || metadata.height > this.MAX_SIZE);

      if (needsResize) {
        // Resize while maintaining aspect ratio
        const resizedBuffer = await sharp(buffer)
          .resize(this.MAX_SIZE, this.MAX_SIZE, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 90 })
          .toBuffer();

        return resizedBuffer.toString('base64');
      }

      // Convert to JPEG if needed for consistency
      if (metadata.format !== 'jpeg' && metadata.format !== 'jpg') {
        const convertedBuffer = await sharp(buffer)
          .jpeg({ quality: 95 })
          .toBuffer();

        return convertedBuffer.toString('base64');
      }

      return base64Data;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error(
        `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate image format
   */
  isValidFormat(base64Image: string): boolean {
    const dataUrlMatch = base64Image.match(/^data:image\/(\w+);base64,/);
    if (dataUrlMatch) {
      const format = dataUrlMatch[1].toLowerCase();
      return ['jpeg', 'jpg', 'png', 'webp'].includes(format);
    }

    // Assume valid if no data URL prefix
    return true;
  }
}

export const imageProcessor = new ImageProcessor();
