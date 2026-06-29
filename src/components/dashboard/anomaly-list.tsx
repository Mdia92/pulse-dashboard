"use client";

import { useEffect, useState } from "react";
import type { Anomaly } from "@/lib/types/pulse";

const severityStyles = {
  low: "border-zinc-700 text-zinc-400",
  medium: "border-amber-800 text-amber-400",
  high: "border-rose-800 text-rose-400",
};

interface AnomaliesResponse {
  source: "dynamodb" | "mock";
  anomalies: Anomaly[];
}

export function AnomalyList() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/anomalies");
        if (!response.ok) {
          throw new Error("Anomalies API request failed");
        }
        const data = (await response.json()) as AnomaliesResponse;
        if (!cancelled) {
          setAnomalies(data.anomalies);
        }
      } catch {
        if (!cancelled) {
          setAnomalies([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-slate-500">Loading anomaly signals…</p>
    );
  }

  if (anomalies.length === 0) {
    return (
      <p className="border border-[#1e3a5f] bg-[#111827] p-6 text-sm text-slate-400">
        No anomalies detected in the current hour — demand is stable.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {anomalies.map((anomaly) => (
        <li
          key={anomaly.id}
          className={`rounded-lg border bg-zinc-900 p-4 ${severityStyles[anomaly.severity]}`}
        >
          <p className="text-sm font-medium text-zinc-100">{anomaly.message}</p>
          <p className="mt-2 text-xs text-zinc-500">
            {anomaly.zone} · {anomaly.sku} ·{" "}
            {anomaly.deltaPct >= 0 ? "+" : ""}
            {anomaly.deltaPct}%
          </p>
        </li>
      ))}
    </ul>
  );
}
