const jwt = require("jsonwebtoken");

module.exports = {
  signJWT: (payload, expiresIn = "1h") =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn }),

  verifyJWT: (token) =>
    jwt.verify(token, process.env.JWT_SECRET),

  validateApiKey: (key) => {
    if (key !== process.env.API_KEY) throw new Error("Invalid API key");
    return true;
  },
};
