const express = require("express");
const config = require("./config");
const { handleCrc } = require("./webhook/crc");
const { handleWebhook } = require("./webhook/handler");
const {
  registerWebhook,
  subscribeAccount,
  deleteWebhook,
  getWebhookStatus,
} = require("./webhook/setup");
const { postTestReply } = require("./api/xApiV2");
const store = require("./store");

const app = express();
const startTime = Date.now();

// Parse JSON body and capture raw body for signature validation
app.use(
  express.json({
    verify(req, _res, buf) {
      req.rawBody = buf.toString("utf8");
    },
  })
);

// --- Webhook endpoints ---

app.get("/webhook/twitter", handleCrc);
app.post("/webhook/twitter", handleWebhook);

// --- Health & monitoring ---

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: Math.round((Date.now() - startTime) / 1000),
    startedAt: new Date(startTime).toISOString(),
  });
});

app.get("/stats", (_req, res) => {
  res.json(store.getStats());
});

app.get("/participants", (_req, res) => {
  res.json(store.getAllParticipants());
});

app.get("/participant/:id", (req, res) => {
  const participant = store.getParticipant(req.params.id);
  if (!participant) {
    return res.status(404).json({ error: "Participant not found" });
  }
  res.json(store.serialize(participant));
});

// --- Admin / webhook management ---

app.post("/admin/setup-webhook", async (_req, res) => {
  try {
    const webhook = await registerWebhook();
    await subscribeAccount();
    res.json({ ok: true, webhook });
  } catch (err) {
    console.error("Webhook setup failed:", err.response?.data || err.message);
    res.status(500).json({
      error: "Webhook setup failed",
      details: err.response?.data || err.message,
    });
  }
});

app.post("/admin/delete-webhook", async (_req, res) => {
  try {
    await deleteWebhook();
    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook delete failed:", err.response?.data || err.message);
    res.status(500).json({
      error: "Webhook delete failed",
      details: err.response?.data || err.message,
    });
  }
});

app.post("/admin/delete-webhook/:id", async (req, res) => {
  try {
    await deleteWebhook(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook delete failed:", err.response?.data || err.message);
    res.status(500).json({
      error: "Webhook delete failed",
      details: err.response?.data || err.message,
    });
  }
});

app.get("/admin/webhook-status", async (_req, res) => {
  const status = await getWebhookStatus();
  res.json(status);
});

// --- Testing ---

app.post("/admin/test-reply/:handle", async (req, res) => {
  const handle = req.params.handle.replace(/^@/, "");
  try {
    const tweetId = await postTestReply(handle);
    res.json({ ok: true, tweetId });
  } catch (err) {
    console.error("Test reply failed:", err.response?.data || err.message);
    res.status(500).json({
      error: "Test reply failed",
      details: err.response?.data || err.message,
    });
  }
});

// --- Start ---

app.listen(config.port, () => {
  console.log(`Pitch Pursuit service running on port ${config.port}`);
  console.log(`Webhook endpoint: ${config.webhookUrl || "(not configured)"}`);
});
