/**
 * ImageCompressor Service
 * Reduces payload size before transmission to the AI Cluster.
 */
class ImageCompressor {
  /**
   * Compresses an image and returns a base64 string.
   * @param {File|string} imageSource - The File object or Image DataURL.
   * @param {Object} options - Compression settings.
   */
  async compress(imageSource, { maxWidth = 800, quality = 0.7 } = {}) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Handle both File objects and existing Base64 strings
      if (imageSource instanceof File) {
        img.src = URL.createObjectURL(imageSource);
      } else {
        img.src = imageSource;
      }

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio downscaling
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to low-quality JPEG (much smaller than PNG)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        // Cleanup memory if using ObjectURLs
        if (imageSource instanceof File) URL.revokeObjectURL(img.src);
        
        resolve(compressedBase64);
      };

      img.onerror = (err) => reject(new Error("Failed to load image for compression."));
    });
  }

  /**
   * Helper to estimate the size of a base64 string in KB
   */
  getByteSize(base64String) {
    const stringLength = base64String.length - (base64String.indexOf(',') + 1);
    const sizeInBytes = (stringLength * 3) / 4;
    return (sizeInBytes / 1024).toFixed(2);
  }
}

/**
 * ImageCompressor
 * Resizes and compresses images to save bandwidth.
 */
class ImageCompressor {
  async compress(dataUrl, { maxWidth = 640, quality = 0.7 } = {}) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  }
}

export default new ImageCompressor();
