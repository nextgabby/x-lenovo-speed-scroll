# Pitch Pursuit — Lenovo x FIFA World Cup 2026

Backend service for the "Pitch Pursuit" speed-scroll campaign on X (Twitter). Users race through a series of Lenovo posts by liking them as fast as possible, and the service replies with their result as a nullcast tweet.

## How the Game Works

1. **Like the CTA post** — starts your timer ("the goalie passes you the ball")
2. **Like the 3 middle posts** — make plays on the field (any order)
3. **Like the last post** — take your shot

The service calculates elapsed time and how many middle posts were liked, then replies telling the user if they scored.

### Scoring

| Result | Condition |
|--------|-----------|
| GOAL | Liked 2-3 middle posts + finished in under 15 seconds |
| MISS | Liked 0-1 middle posts, OR took over 15 seconds |
| Offside | Liked the last post without ever liking the CTA |

## API Strategy

- **X Account Activity API (webhooks)** — receives real-time `favorite_events` when users like the campaign posts. No polling needed.
- **X API v2** — sends nullcast reply tweets. Nullcast tweets are public but don't appear on the Lenovo timeline; the user sees them via @mention notification.

## Setup

### Prerequisites

- Node.js 18+
- X Developer account with Account Activity API access
- A dev environment created in the X developer portal

### 1. Clone and install

```bash
npm install
```

### 2. Configure credentials

Copy `.env.example` to `.env` and fill in your X API credentials:

```bash
cp .env.example .env
```

### 3. Local development with ngrok

The Account Activity API requires a publicly accessible HTTPS URL. Use ngrok for local development:

```bash
# Terminal 1: Start ngrok
ngrok http 3000
# Copy the https://xxxx.ngrok-free.app URL and set it as WEBHOOK_URL in .env

# Terminal 2: Start the service
npm start
```

### 4. Register the webhook

Once the service is running:

```bash
curl -X POST http://localhost:3000/admin/setup-webhook
```

This registers your webhook URL with X and subscribes the campaign account.

### 5. Test

Like the CTA post from any X account and watch the console logs.

## Endpoints

### Webhook (required by X)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/webhook/twitter` | CRC challenge response |
| POST | `/webhook/twitter` | Incoming account activity events |

### Monitoring

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health + uptime |
| GET | `/stats` | Campaign stats (total, active, goals, misses, avg time) |
| GET | `/participants` | List all participants and their status |
| GET | `/participant/:id` | Single participant detail |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| POST | `/admin/setup-webhook` | Register webhook URL + subscribe account |
| POST | `/admin/delete-webhook` | Remove webhook registration |
| GET | `/admin/webhook-status` | Check webhook and subscription status |
| POST | `/admin/test-reply/:handle` | Send a test nullcast reply to verify posting works |

## File Structure

```
src/
  index.js                 Express server + all routes
  config.js                Post IDs, scoring thresholds, env config
  store.js                 In-memory participant store
  webhook/
    crc.js                 CRC challenge response handler
    validator.js           Webhook signature validation
    handler.js             POST /webhook/twitter event handler
    setup.js               Webhook registration + account subscription
  api/
    auth.js                OAuth 1.0a signature generation
    xApiV2.js              X API v2 client (nullcast tweet posting)
  game/
    eventProcessor.js      Routes favorite_events to the correct handler
    scorer.js              Scoring logic (time + middle likes)
    replyComposer.js       Builds reply text
```

## Nullcast Behavior

Reply tweets are sent with `"nullcast": true` via X API v2. This means:

- The tweet is **public** and can be found via direct URL
- It does **not** appear on the Lenovo account's timeline or in followers' feeds
- The mentioned user sees it via their **notifications** (because the tweet starts with `@username`)

## Production Notes

- **Data store**: This service uses an in-memory Map. For production, use Redis or a database to persist participant data across restarts.
- **Rate limits**: X API v2 tweet creation is rate-limited. Monitor for 429 responses.
- **Sandbox tier**: The free Account Activity API tier allows 1 webhook and up to 15 subscriptions — sufficient for this campaign (1 subscription for the Lenovo account).

## Troubleshooting

- **CRC failures**: Ensure `X_API_SECRET` is correct. X sends CRC challenges periodically — if the response is wrong, the webhook gets deactivated.
- **No events received**: Verify the webhook is registered and the account is subscribed (`GET /admin/webhook-status`). Re-register if needed.
- **Signature validation errors**: The raw request body must be preserved for signature validation. The Express JSON parser is configured to capture this automatically.
- **Missing events**: X may not deliver events if the webhook was recently deactivated. Re-register and re-subscribe.
- **Reply not appearing**: Nullcast tweets don't show on the timeline. Check the user's notifications or use the tweet ID URL directly.
