"use client";

import { useEffect, useState } from "react";
import { AgentInsightCard } from "@/components/v0/agent-insight-card";
import {
  TransactionTable,
  type Transaction,
} from "@/components/v0/transaction-table";
import { ZoneDemandCard } from "@/components/dashboard/zone-demand-card";
import type { ZoneDemand } from "@/lib/types/pulse";

interface DemandResponse {
  source: "dynamodb" | "mock";
  zoneDemand: ZoneDemand[];
}

function zoneDemandToTransactions(demand: ZoneDemand[]): Transaction[] {
  return demand.map((item, index) => ({
    id: `TXN-${String(index + 1).padStart(4, "0")}`,
    time: new Date(item.hour).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    zone: item.zone,
    category: item.category,
    amount: `${item.txnCount} txns`,
    status: "completed",
  }));
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 border border-[#1e3a5f] bg-[#111827]">
      <div
        className="size-10 animate-spin border-2 border-cyan-400/25 border-t-cyan-400"
        aria-hidden
      />
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400">
        Syncing live demand
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [zoneDemand, setZoneDemand] = useState<ZoneDemand[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDemand() {
      try {
        const response = await fetch("/api/demand");
        if (!response.ok) {
          throw new Error("Demand API request failed");
        }

        const data = (await response.json()) as DemandResponse;
        if (!cancelled) {
          setZoneDemand(data.zoneDemand);
        }
      } catch {
        if (!cancelled) {
          setZoneDemand([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDemand();

    return () => {
      cancelled = true;
    };
  }, []);

  const transactions = zoneDemandToTransactions(zoneDemand);
  const hourlyTotal = zoneDemand.reduce((sum, item) => sum + item.txnCount, 0);

  return (
    <div className="space-y-6">
      <header className="border-b border-[#1e3a5f] pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
          Live Zone
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Real-time demand within 500m · merchant view
        </p>
      </header>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Live Demand Grid
              </h3>
              <span className="text-xs text-cyan-400">
                {hourlyTotal} txns this hour
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zoneDemand.map((item) => (
                <ZoneDemandCard
                  key={`${item.zone}-${item.category}`}
                  zone={item.zone}
                  category={item.category}
                  txnCount={item.txnCount}
                  deltaPct={item.deltaPct}
                />
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <TransactionTable
              transactions={transactions}
              hourlyTotal={hourlyTotal}
            />
            <AgentInsightCard />
          </div>
        </>
      )}
    </div>
  );
}
