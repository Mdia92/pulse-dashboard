# Pulse DynamoDB Access Patterns

Single-table design for the mobile-money transaction event stream.

## Table: `pulse-events`

| Attribute | Type | Role |
|-----------|------|------|
| `PK` | String | `merchant_zone#hour` (e.g. `dakar-almadies#2026-06-27T14`) |
| `SK` | String | `txn_id` |
| `category` | String | Product category (e.g. `biscuits`, `baby_formula`) |
| `amount_fcfa` | Number | Transaction amount |
| `merchant_id` | String | Anonymized merchant reference |
| `created_at` | String | ISO 8601 timestamp |

## Access Patterns

### AP1 — Hot-zone reads (dashboard)

- **Query:** `PK = :zoneHour`
- **Use case:** "What sold in zone X in the last hour?"
- **Latency target:** single-digit ms

### AP2 — Category trend (anomalies)

- **Query:** GSI `category#hour` = `:categoryHour`
- **Use case:** Detect category spikes (e.g. biscuits +240% in zone)
- **GSI:** `GSI1PK` = `category#hour`, `GSI1SK` = `txn_id`

### AP3 — Webhook ingest (write-heavy)

- **PutItem:** `PK`, `SK`, attributes
- **Use case:** Mobile money webhook batch writes from Wave/Orange/MTN
- **Throughput:** millions of low-latency writes

## Aurora DSQL (merchant state)

Separate store for merchant directory, WhatsApp OTP sessions, and subscription billing — active-active multi-region for merchants moving between Dakar and Abidjan.
