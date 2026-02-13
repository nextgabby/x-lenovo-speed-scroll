const crypto = require("crypto");
const config = require("../config");

function validateSignature(signature, body) {
  if (!signature) return false;

  const expectedHash =
    "sha256=" +
    crypto
      .createHmac("sha256", config.x.apiSecret)
      .update(body)
      .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedHash)
    );
  } catch {
    return false;
  }
}

module.exports = { validateSignature };
