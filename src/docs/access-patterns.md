# Pulse DynamoDB Access Patterns

Single-table design for the mobile-money transaction event stream.

## Table: `pulse_event_stream`

| Attribute | Type | Role |
|-----------|------|------|
| `merchant_zone#hour` | String | Partition key (e.g. `North District#2026-06-28T16`) |
| `txn_id` | String | Sort key (UUID) |
| `category#hour` | String | Category + hour (GSI partition key) |
| `qty` | Number | Quantity sold |
| `price` | Number | Transaction amount |

## Global Secondary Index: `category-hour-index`

| Key | Attribute |
|-----|-----------|
| HASH | `category#hour` |
| RANGE | `txn_id` |

## Access Patterns

### AP1 — Hot-zone reads (dashboard)

- **Query:** `merchant_zone#hour = :zoneHour`
- **Use case:** "What sold in zone X in the last hour?"
- **API:** `GET /api/demand`

### AP2 — Category trend (anomalies)

- **Query:** Compare current vs previous hour partition for a zone
- **Use case:** Detect category spikes (e.g. beverages +240%)
- **API:** `GET /api/anomalies`
- **GSI:** Available for cross-zone category queries via `category-hour-index`

### AP3 — Webhook ingest (write-heavy)

- **PutItem:** partition key, sort key, attributes
- **Use case:** Mobile money webhook writes from Wave/Orange/MTN
- **API:** `POST /api/webhooks/mobile-money`

## Aurora DSQL (merchant state)

Separate store for merchant directory, subscriptions, and agent message drafts.

| Table | Purpose |
|-------|---------|
| `merchant_directory` | Merchant identity + zone |
| `subscriptions` | Billing status (7,000 FCFA/month) |
| `agent_messages` | WhatsApp draft approval queue |
