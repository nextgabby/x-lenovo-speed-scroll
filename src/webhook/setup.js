const axios = require("axios");
const { getAuthHeader } = require("../api/auth");
const config = require("../config");

const BASE = "https://api.x.com";

// Store the webhook ID after registration so subscriptions can reference it
let registeredWebhookId = null;

async function registerWebhook() {
  // Check if a webhook for our URL already exists
  const existing = await getWebhooks();
  const match = existing.find((w) => w.url === config.webhookUrl);
  if (match) {
    registeredWebhookId = match.id;
    console.log("Webhook already registered:", match);
    return match;
  }

  const url = `${BASE}/2/webhooks`;

  const res = await axios.post(
    url,
    { url: config.webhookUrl },
    {
      headers: {
        Authorization: `Bearer ${config.x.bearerToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  registeredWebhookId = res.data.id;
  console.log("Webhook registered:", res.data);
  return res.data;
}

async function subscribeAccount() {
  const webhookId = await resolveWebhookId();
  const url = `${BASE}/2/account_activity/webhooks/${webhookId}/subscriptions/all`;

  const request = { url, method: "POST" };
  const authHeader = getAuthHeader(request);

  const res = await axios.post(url, null, {
    headers: { ...authHeader },
  });

  console.log("Account subscribed to webhook");
  return res.data;
}

async function deleteWebhook(webhookId) {
  if (!webhookId) {
    webhookId = await resolveWebhookId();
  }

  const url = `${BASE}/2/webhooks/${webhookId}`;

  await axios.delete(url, {
    headers: {
      Authorization: `Bearer ${config.x.bearerToken}`,
    },
  });

  if (registeredWebhookId === webhookId) {
    registeredWebhookId = null;
  }

  console.log("Webhook deleted:", webhookId);
}

async function getWebhooks() {
  const url = `${BASE}/2/webhooks`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${config.x.bearerToken}`,
    },
  });

  return res.data.data || [];
}

async function getSubscriptions(webhookId) {
  if (!webhookId) {
    webhookId = await resolveWebhookId();
  }

  const url = `${BASE}/2/account_activity/webhooks/${webhookId}/subscriptions/all/list`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${config.x.bearerToken}`,
    },
  });

  return res.data.data || res.data;
}

async function getWebhookStatus() {
  try {
    const webhooks = await getWebhooks();
    const ours = webhooks.find((w) => w.url === config.webhookUrl) || null;
    let subscriptions = null;
    if (ours) {
      try {
        subscriptions = await getSubscriptions(ours.id);
      } catch {
        // May fail if no subscriptions exist
      }
    }
    return { ours, allWebhooks: webhooks, subscriptions };
  } catch (err) {
    return { error: err.response?.data || err.message };
  }
}

async function resolveWebhookId() {
  if (registeredWebhookId) return registeredWebhookId;

  const webhooks = await getWebhooks();
  if (webhooks.length === 0) {
    throw new Error("No webhooks registered. Run setup-webhook first.");
  }

  // Find the webhook matching our configured URL
  const match = webhooks.find((w) => w.url === config.webhookUrl);
  if (match) {
    registeredWebhookId = match.id;
    return registeredWebhookId;
  }

  throw new Error(
    `No webhook found for ${config.webhookUrl}. Run setup-webhook first.`
  );
}

module.exports = {
  registerWebhook,
  subscribeAccount,
  deleteWebhook,
  getWebhookStatus,
};
