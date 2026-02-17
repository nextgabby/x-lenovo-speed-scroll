const axios = require("axios");
const { getAuthHeader } = require("../api/auth");
const config = require("../config");

const BASE = "https://api.x.com";

// Store the webhook ID after registration so subscriptions can reference it
let registeredWebhookId = null;

async function registerWebhook() {
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
    let subscriptions = null;
    if (webhooks.length > 0) {
      try {
        subscriptions = await getSubscriptions(webhooks[0].id);
      } catch {
        // May fail if no subscriptions exist
      }
    }
    return { webhooks, subscriptions };
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

  registeredWebhookId = webhooks[0].id;
  return registeredWebhookId;
}

module.exports = {
  registerWebhook,
  subscribeAccount,
  deleteWebhook,
  getWebhookStatus,
};
