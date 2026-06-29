export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancelled";

export interface Merchant {
  id: string;
  zone: string;
  phone: string;
  subscriptionStatus: SubscriptionStatus;
}

export interface ZoneDemand {
  zone: string;
  hour: string;
  category: string;
  txnCount: number;
  deltaPct: number;
}

export type AnomalySeverity = "low" | "medium" | "high";

export interface Anomaly {
  id: string;
  message: string;
  severity: AnomalySeverity;
  sku: string;
  zone: string;
  deltaPct: number;
}

export type AgentDraftStatus = "draft" | "approved" | "sent";

export interface AgentDraft {
  id: string;
  messageBody: string;
  recipientCount: number;
  status: AgentDraftStatus;
  createdAt: string;
}

export interface DashboardData {
  merchants: Merchant[];
  zoneDemand: ZoneDemand[];
  anomalies: Anomaly[];
  agentDraft: AgentDraft;
}

export const MOCK_DASHBOARD_DATA: DashboardData = {
  merchants: [
    {
      id: "MCH-001",
      zone: "North District",
      phone: "+1 555 010 2001",
      subscriptionStatus: "active",
    },
    {
      id: "MCH-002",
      zone: "Central Plaza",
      phone: "+1 555 010 2002",
      subscriptionStatus: "trial",
    },
    {
      id: "MCH-003",
      zone: "East Market",
      phone: "+1 555 010 2003",
      subscriptionStatus: "active",
    },
    {
      id: "MCH-004",
      zone: "North District",
      phone: "+1 555 010 2004",
      subscriptionStatus: "past_due",
    },
  ],
  zoneDemand: [
    {
      zone: "North District",
      hour: "2026-06-27T14:00:00Z",
      category: "Beverages",
      txnCount: 47,
      deltaPct: 240,
    },
    {
      zone: "Central Plaza",
      hour: "2026-06-27T14:00:00Z",
      category: "Household essentials",
      txnCount: 23,
      deltaPct: 18,
    },
    {
      zone: "East Market",
      hour: "2026-06-27T14:00:00Z",
      category: "Cooking supplies",
      txnCount: 31,
      deltaPct: -12,
    },
  ],
  anomalies: [
    {
      id: "anom-001",
      message: "240% spike in beverage sales — restock immediately",
      severity: "high",
      sku: "beverages",
      zone: "North District",
      deltaPct: 240,
    },
    {
      id: "anom-002",
      message: "Household essentials purchases shifting 3 days earlier this month",
      severity: "medium",
      sku: "household_essentials",
      zone: "Central Plaza",
      deltaPct: 18,
    },
    {
      id: "anom-003",
      message: "Cooking supplies demand down 12% — consider a targeted discount",
      severity: "low",
      sku: "cooking_supplies",
      zone: "East Market",
      deltaPct: -12,
    },
  ],
  agentDraft: {
    id: "draft-001",
    messageBody:
      "Hello! Beverage sales are surging in the North District today. Visit us before closing and show this message at checkout for $5 off your next purchase. Thank you for your continued support.",
    recipientCount: 84,
    status: "draft",
    createdAt: "2026-06-27T14:05:00Z",
  },
};
