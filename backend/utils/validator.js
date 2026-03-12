const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || "image/jpeg,image/png,image/webp").split(",");
const maxSize = parseInt(process.env.MAX_IMAGE_SIZE || "5242880", 10); // 5MB

module.exports = {
  validateImage: (buffer, mimeType) => {
    if (!buffer || buffer.length > maxSize) throw new Error("Image too large");
    if (!allowedTypes.includes(mimeType)) throw new Error("Invalid image type");
    return true;
  },

  validateApiKey: (key) => {
    if (key !== process.env.API_KEY) throw new Error("Invalid API key");
    return true;
  },
};
