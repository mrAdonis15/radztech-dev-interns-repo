/**
 * Image compression utilities using Canvas API.
 * Supports JPEG and PNG output with quality control and resize.
 */

const JPEG_MIME = "image/jpeg";
const PNG_MIME = "image/png";

/**
 * Format file size for display
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Load image as HTMLImageElement
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compress image using Canvas
 * @param {File} file - Original image file
 * @param {Object} options
 * @param {number} [options.quality=0.8] - JPEG quality 0-1
 * @param {number} [options.maxWidth] - Max width in px (keeps aspect)
 * @param {number} [options.maxHeight] - Max height in px (keeps aspect)
 * @returns {Promise<{ blob: Blob, url: string, originalSize: number, compressedSize: number }>}
 */
export async function compressImage(file, options = {}) {
  const {
    quality = 0.8,
    maxWidth,
    maxHeight,
  } = options;

  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  let { width, height } = img;

  if (maxWidth || maxHeight) {
    const ratio = Math.min(
      maxWidth ? maxWidth / width : 1,
      maxHeight ? maxHeight / height : 1
    );
    if (ratio < 1) {
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  const isPng = file.type === PNG_MIME;
  const mimeType = isPng ? PNG_MIME : JPEG_MIME;
  const outputQuality = isPng ? Math.min(1, quality * 1.2) : quality;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        URL.revokeObjectURL(img.src);
        if (!blob) {
          reject(new Error("Compression failed"));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          originalSize: file.size,
          compressedSize: blob.size,
          width,
          height,
        });
      },
      mimeType,
      outputQuality
    );
  });
}

/**
 * Create download link for blob
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
