const { validateSignature } = require("./validator");
const { processEvent } = require("../game/eventProcessor");

// Keep recent webhook activity in memory for debugging
const recentLogs = [];
const MAX_LOGS = 50;

function log(entry) {
  const item = { timestamp: new Date().toISOString(), ...entry };
  recentLogs.unshift(item);
  if (recentLogs.length > MAX_LOGS) recentLogs.pop();
  console.log(JSON.stringify(item));
}

function handleWebhook(req, res) {
  const signature = req.headers["x-twitter-webhooks-signature"];
  const rawBody = req.rawBody;

  log({
    type: "incoming",
    hasSignature: !!signature,
    forUserId: req.body?.for_user_id || null,
    bodyKeys: Object.keys(req.body || {}),
    bodyPreview: rawBody?.substring(0, 200),
  });

  if (!validateSignature(signature, rawBody)) {
    log({ type: "error", message: "Invalid webhook signature" });
    return res.status(403).json({ error: "Invalid signature" });
  }

  // Respond immediately — process events asynchronously
  res.status(200).json({ ok: true });

  const body = req.body;
  if (body.favorite_events) {
    for (const event of body.favorite_events) {
      log({
        type: "favorite",
        postId: event.favorited_status?.id_str,
        userId: event.user?.id_str,
        username: event.user?.screen_name,
      });
      try {
        processEvent(event);
      } catch (err) {
        log({ type: "error", message: err.message });
      }
    }
  }
}

function getRecentLogs() {
  return recentLogs;
}

module.exports = { handleWebhook, getRecentLogs };
