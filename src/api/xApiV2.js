const axios = require("axios");
const { getAuthHeader } = require("./auth");

const TWEETS_URL = "https://api.x.com/2/tweets";

async function postReply(text) {
  const body = {
    text,
    nullcast: true,
  };

  const request = {
    url: TWEETS_URL,
    method: "POST",
  };

  const authHeader = getAuthHeader(request);

  const res = await axios.post(TWEETS_URL, body, {
    headers: {
      ...authHeader,
      "Content-Type": "application/json",
    },
  });

  return res.data?.data?.id || null;
}

async function postTestReply(handle) {
  const text = `@${handle} This is a test reply from the Pitch Pursuit campaign service. If you see this, nullcast replies are working!`;

  return postReply(text);
}

module.exports = { postReply, postTestReply };
