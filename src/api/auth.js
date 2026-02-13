const crypto = require("crypto");
const OAuth = require("oauth-1.0a");
const config = require("../config");

const oauth = OAuth({
  consumer: {
    key: config.x.apiKey,
    secret: config.x.apiSecret,
  },
  signature_method: "HMAC-SHA256",
  hash_function(baseString, key) {
    return crypto.createHmac("sha256", key).update(baseString).digest("base64");
  },
});

const token = {
  key: config.x.accessToken,
  secret: config.x.accessTokenSecret,
};

function getAuthHeader(request) {
  return oauth.toHeader(oauth.authorize(request, token));
}

module.exports = { getAuthHeader };
