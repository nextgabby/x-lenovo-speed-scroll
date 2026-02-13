const crypto = require("crypto");
const config = require("../config");

function handleCrc(req, res) {
  const crcToken = req.query.crc_token;
  if (!crcToken) {
    return res.status(400).json({ error: "Missing crc_token" });
  }

  const hmac = crypto
    .createHmac("sha256", config.x.apiSecret)
    .update(crcToken)
    .digest("base64");

  return res.json({ response_token: `sha256=${hmac}` });
}

module.exports = { handleCrc };
