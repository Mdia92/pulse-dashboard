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
