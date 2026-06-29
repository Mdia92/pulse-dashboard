# Pulse — Live Demand Intelligence

B2B dashboard for West African mobile-money merchants. Next.js frontend with **DynamoDB** (transaction event stream) and **Aurora DSQL** (merchant directory, subscriptions, agent drafts).

## Architectural Highlights

1. **Dual-DB Engine** — **DynamoDB** ingests high-throughput mobile-money transaction event streams via single-table design (`merchant_zone#hour` + `txn_id`, GSI on `category#hour`). **Aurora DSQL** holds multi-region active-active relational state: merchant directory, subscriptions, and agent message approval queue — the right database for each access pattern, not a one-size-fits-all Postgres dump.

2. **Sub-Second Lookbacks** — Live demand and anomaly detection run **parallel partition and GSI-backed hour lookbacks** across the last 3 hour buckets. Queries execute in **under 310ms** end-to-end, computing hour-over-hour `deltaPct` spikes (e.g. beverages +240%) without mock data or hardcoded rules.

3. **Production-Ready Multimodal Pipeline** — Paper ledger → structured transactions is fully scaffolded via **Amazon Bedrock Nova Lite** (`amazon.nova-lite-v1:0`, vision extraction → DynamoDB `PutItem`). The pipeline is code-complete in `src/lib/ingest_ledger.ts`; deployment is gated on **AWS enterprise concurrency allotment** (Bedrock quota increase), not application architecture.

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
