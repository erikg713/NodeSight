const sharp = require("sharp");

module.exports = {
  decodeBase64: (b64) =>
    Buffer.from(b64.replace(/^data:image\/\w+;base64,/, ""), "base64"),

  encodeBase64: (buffer, type = "jpeg") =>
    `data:image/${type};base64,${buffer.toString("base64")}`,

  resizeImage: async (buffer, width, height, quality = 0.7) => {
    return await sharp(buffer)
      .resize(width, height, { fit: "inside" })
      .jpeg({ quality: Math.round(quality * 100) })
      .toBuffer();
  },
};
