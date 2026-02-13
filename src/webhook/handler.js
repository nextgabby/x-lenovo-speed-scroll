const { validateSignature } = require("./validator");
const { processEvent } = require("../game/eventProcessor");

function handleWebhook(req, res) {
  const signature = req.headers["x-twitter-webhooks-signature"];
  const rawBody = req.rawBody;

  if (!validateSignature(signature, rawBody)) {
    console.error("Invalid webhook signature");
    return res.status(403).json({ error: "Invalid signature" });
  }

  // Respond immediately — process events asynchronously
  res.status(200).json({ ok: true });

  const body = req.body;
  if (body.favorite_events) {
    for (const event of body.favorite_events) {
      try {
        processEvent(event);
      } catch (err) {
        console.error("Error processing favorite event:", err);
      }
    }
  }
}

module.exports = { handleWebhook };
