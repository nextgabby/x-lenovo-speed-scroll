const axios = require("axios");
const { getAuthHeader } = require("../api/auth");
const config = require("../config");

const BASE = "https://api.x.com/1.1/account_activity/all";

async function registerWebhook() {
  const env = config.webhookEnv;
  const url = `${BASE}/${env}/webhooks.json`;

  const res = await axios.post(url, null, {
    params: { url: config.webhookUrl },
    headers: {
      Authorization: `Bearer ${config.x.bearerToken}`,
    },
  });

  console.log("Webhook registered:", res.data);
  return res.data;
}

async function subscribeAccount() {
  const env = config.webhookEnv;
  const url = `${BASE}/${env}/subscriptions.json`;

  const request = { url, method: "POST" };
  const authHeader = getAuthHeader(request);

  await axios.post(url, null, {
    headers: { ...authHeader },
  });

  console.log("Account subscribed to webhook");
}

async function deleteWebhook(webhookId) {
  const env = config.webhookEnv;

  // If no ID provided, look up the current webhook
  if (!webhookId) {
    const webhooks = await getWebhooks();
    if (webhooks.length === 0) {
      console.log("No webhooks registered");
      return;
    }
    webhookId = webhooks[0].id;
  }

  const url = `${BASE}/${env}/webhooks/${webhookId}.json`;

  await axios.delete(url, {
    headers: {
      Authorization: `Bearer ${config.x.bearerToken}`,
    },
  });

  console.log("Webhook deleted:", webhookId);
}

async function getWebhooks() {
  const env = config.webhookEnv;
  const url = `${BASE}/${env}/webhooks.json`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${config.x.bearerToken}`,
    },
  });

  return res.data;
}

async function getSubscriptions() {
  const env = config.webhookEnv;
  const url = `${BASE}/${env}/subscriptions/list.json`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${config.x.bearerToken}`,
    },
  });

  return res.data;
}

async function getWebhookStatus() {
  try {
    const webhooks = await getWebhooks();
    let subscriptions = null;
    try {
      subscriptions = await getSubscriptions();
    } catch {
      // May fail if no subscriptions exist
    }
    return { webhooks, subscriptions };
  } catch (err) {
    return { error: err.response?.data || err.message };
  }
}

module.exports = {
  registerWebhook,
  subscribeAccount,
  deleteWebhook,
  getWebhookStatus,
};
