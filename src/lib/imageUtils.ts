/**
 * Utility functions for client-side image compression, resizing, and validation.
 * Ensures uploads are well within server and proxy payload limits (preventing HTTP 413)
 * while preserving high visual fidelity and sharpness for portfolio graphics.
 */

export interface CompressionOptions {
  /**
   * Maximum width or height in pixels. Default: 2560 (2.5K Ultra-HD).
   */
  maxDimension?: number;
  /**
   * Quality level for lossy formats (0.1 - 1.0). Default: 0.88.
   */
  quality?: number;
  /**
   * File size threshold in bytes above which compression is triggered. Default: 1.5MB.
   */
  sizeThresholdBytes?: number;
}

const SUPPORTED_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|svg|gif|avif|bmp|ico|tiff?)$/i;

/**
 * Validates whether a file is a supported image and within safe operational limits.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (file.size === 0) {
    return { valid: false, error: `File "${file.name}" is empty (0 bytes).` };
  }

  const isImageMime = file.type.startsWith('image/');
  const isImageExt = SUPPORTED_IMAGE_EXTENSIONS.test(file.name);

  if (!isImageMime && !isImageExt) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported image file. Please choose JPG, PNG, WEBP, or SVG.`,
    };
  }

  // Hard safety limit: files > 60MB are genuine anomalies for web uploads
  if (file.size > 60 * 1024 * 1024) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds the 60MB maximum limit. Please choose a smaller file.`,
    };
  }

  return { valid: true };
}

/**
 * Checks if a canvas contains transparent pixels.
 */
function hasCanvasAlpha(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    // Sample a grid of pixels to keep execution sub-millisecond
    const stepX = Math.max(1, Math.floor(width / 32));
    const stepY = Math.max(1, Math.floor(height / 32));
    const imgData = ctx.getImageData(0, 0, width, height).data;

    for (let y = 0; y < height; y += stepY) {
      for (let x = 0; x < width; x += stepX) {
        const alphaIndex = (y * width + x) * 4 + 3;
        if (imgData[alphaIndex] < 250) {
          return true;
        }
      }
    }
  } catch {
    // If getImageData fails (e.g. security origin), assume transparency could exist
    return false;
  }
  return false;
}

/**
 * Automatically resizes and compresses an image on the client if it exceeds
 * safe dimensions or file size limits.
 *
 * - Skips SVG (vector) and GIF (animations) to preserve original properties.
 * - Scales down giant images (e.g. 5000x4000) to maxDimension (default 2560px).
 * - Converts heavy PNGs/JPEGs to optimized high-quality JPEG or WebP.
 * - Always falls back to original file if compression fails or yields larger output.
 */
export async function compressImageIfNeeded(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxDimension = 2560,
    quality = 0.88,
    sizeThresholdBytes = 1.5 * 1024 * 1024, // 1.5MB
  } = options;

  // 1. Skip non-raster or scalable formats
  const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
  const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name);
  if (isSvg || isGif) {
    return file;
  }

  // 2. If running in a non-browser environment (SSR), return as-is
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  // 3. Check if compression is needed based on size
  const needsSizeReduction = file.size > sizeThresholdBytes;

  try {
    // Load image into an HTMLImageElement
    const objectUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = objectUrl;
    });

    URL.revokeObjectURL(objectUrl);

    const origWidth = img.naturalWidth || img.width;
    const origHeight = img.naturalHeight || img.height;

    const needsDimensionReduction = origWidth > maxDimension || origHeight > maxDimension;

    // If file is already small and within dimension bounds, keep original
    if (!needsSizeReduction && !needsDimensionReduction) {
      return file;
    }

    // Calculate new aspect-ratio-preserved dimensions
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (needsDimensionReduction) {
      const scale = Math.min(maxDimension / origWidth, maxDimension / origHeight);
      targetWidth = Math.max(1, Math.round(origWidth * scale));
      targetHeight = Math.max(1, Math.round(origHeight * scale));
    }

    // Render to canvas with high smoothing
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return file;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Determine appropriate output MIME type
    const isPng = file.type === 'image/png' || /\.png$/i.test(file.name);
    const isWebp = file.type === 'image/webp' || /\.webp$/i.test(file.name);

    let outputType = 'image/jpeg';
    let outputExt = '.jpg';

    if (isPng) {
      // Draw first to check transparency
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const hasAlpha = hasCanvasAlpha(ctx, targetWidth, targetHeight);

      if (hasAlpha) {
        // Use WebP if transparent, or keep PNG if WebP is unsupported
        outputType = 'image/webp';
        outputExt = '.webp';
      } else {
        // No transparency: Fill white background and export as JPEG for massive byte savings
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        outputType = 'image/jpeg';
        outputExt = '.jpg';
      }
    } else if (isWebp) {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      outputType = 'image/webp';
      outputExt = '.webp';
    } else {
      // Standard JPEG/other raster
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      outputType = 'image/jpeg';
      outputExt = '.jpg';
    }

    // Convert canvas to Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), outputType, quality);
    });

    if (!blob) {
      return file;
    }

    // If compressed blob is actually smaller, use it
    if (blob.size < file.size) {
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const newFileName = `${baseName}${outputExt}`;
      return new File([blob], newFileName, {
        type: outputType,
        lastModified: Date.now(),
      });
    }

    // If original was somehow smaller, return original
    return file;
  } catch (err) {
    console.warn(`[compressImageIfNeeded] Compression encountered non-fatal error for ${file.name}, using original:`, err);
    return file;
  }
}
