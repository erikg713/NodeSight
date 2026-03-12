/**
 * Utility helpers for NodeSight AI
 * Focuses on image processing and Pi Network formatting.
 */

/**
 * Formats a raw classification probability into a user-friendly percentage.
 * @param {number} probability - Value between 0 and 1
 * @returns {string} - Formatted percentage (e.g., "95.5%")
 */
export const formatConfidence = (probability) => {
  return `${(probability * 100).toFixed(1)}%`;
};

/**
 * Validates if the current environment is the Pi Browser.
 * Useful for showing/hiding Pi-specific features.
 */
export const isPiBrowser = () => {
  return navigator.userAgent.includes("PiBrowser") || !!window.Pi;
};

/**
 * Resizes or crops an image for better AI processing.
 * Some models perform better with square 224x224 inputs.
 * @param {HTMLImageElement} imageElement 
 * @returns {Promise<string>} - Base64 or Blob of processed image
 */
export const preprocessImage = async (imageElement) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // MobileNet V2 typically expects 224x224
  canvas.width = 224;
  canvas.height = 224;
  
  // Simple fill for now; could be updated for aspect-ratio cropping
  ctx.drawImage(imageElement, 0, 0, 224, 224);
  
  return canvas.toDataURL('image/jpeg', 0.8);
};

/**
 * Shortens a Pi Wallet address for UI display.
 * @param {string} address - The full wallet address
 * @returns {string} - e.g., "GD34...7Y2X"
 */
export const truncateAddress = (address) => {
  if (!address) return "";
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};
