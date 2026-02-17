require("dotenv").config();

const posts = {
  cta: "2022361559264018760",
  middle: [
    "2022363898104402340",
    "2022367290583298312",
    "2022367854348149168",
  ],
  last: "2022368240001785909",
};

posts.all = new Set([posts.cta, ...posts.middle, posts.last]);

module.exports = {
  posts,
  scoring: {
    timeLimit: 15,
    minMiddleLikesForGoal: 2,
  },
  x: {
    apiKey: process.env.X_API_KEY,
    apiSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
    bearerToken: process.env.X_BEARER_TOKEN,
  },
  webhookUrl: process.env.WEBHOOK_URL,
  port: process.env.PORT || 3000,
};
