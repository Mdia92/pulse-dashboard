# Pulse — Live Demand Intelligence

B2B dashboard for West African mobile-money merchants. Next.js frontend with **DynamoDB** (transaction event stream) and **Aurora DSQL** (merchant directory, subscriptions, agent drafts).

## Local development

**Port:** Pulse always runs on **3001** (avoids conflicts with other projects on 3000).

```bash
cd pulse-dashboard
cp .env.example .env.local   # fill in AWS credentials
npm install
npm run init:aws             # create DynamoDB table + GSI, seed DSQL
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## AWS setup

| Script | Purpose |
|--------|---------|
| `npm run init:dynamodb` | Create `pulse_event_stream` table + `category-hour-index` GSI |
| `npm run init:dsql` | Create `agent_messages`, `merchant_directory`, `subscriptions` |

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Service + AWS config check |
| `/api/demand` | GET | Live zone demand (`?zone=North%20District`) |
| `/api/anomalies` | GET | Hour-over-hour demand spikes |
| `/api/subscribers` | GET | Merchant directory from DSQL |
| `/api/agent/draft` | GET | Pending WhatsApp draft from DSQL |
| `/api/agent/approve` | POST | Deploy draft (`{ "draftId": "draft-001" }`) |
| `/api/admin/stats` | GET | Live DynamoDB + DSQL counts |
| `/api/webhooks/mobile-money` | POST | Ingest mobile-money transaction |

### Demo webhook

```bash
curl -X POST http://localhost:3001/api/webhooks/mobile-money \
  -H "Content-Type: application/json" \
  -d "{\"zoneId\":\"North District\",\"item\":\"beverages\",\"qty\":12,\"price\":5000}"
```

```bash
curl http://localhost:3001/api/demand
```

## DynamoDB access patterns

See [`src/docs/access-patterns.md`](src/docs/access-patterns.md).

- **PK:** `merchant_zone#hour` · **SK:** `txn_id`
- **GSI:** `category-hour-index` on `category#hour` + `txn_id`

## Bedrock ledger ingest (optional)

Requires Bedrock quota for `amazon.nova-lite-v1:0` in `us-west-2`:

```bash
npx tsx src/lib/test_ingest.ts
```
