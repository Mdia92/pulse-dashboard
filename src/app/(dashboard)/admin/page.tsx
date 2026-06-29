"use client";

import { useEffect, useState } from "react";
import { Database, Globe2 } from "lucide-react";

interface AdminStats {
  dynamodb: {
    tableName: string;
    approximateItemCount: number;
    gsiName: string;
    gsiStatus: string;
    currentHour: string;
    writesThisHour: number;
  };
  dsql: {
    merchantCount: number;
    subscriptionCount: number;
    pendingDrafts: number;
  };
}

const CHART_POINTS = 12;

function DynamoThroughputChart({ stats }: { stats: AdminStats["dynamodb"] }) {
  const [history, setHistory] = useState<number[]>(() =>
    Array.from({ length: CHART_POINTS }, () => stats.writesThisHour),
  );

  useEffect(() => {
    setHistory((prev) => [...prev.slice(1), stats.writesThisHour]);
  }, [stats.writesThisHour]);

  const max = Math.max(...history, 1);
  const width = 100;
  const height = 100;
  const polyline = history
    .map((value, index) => {
      const x = (index / (CHART_POINTS - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex h-full flex-col border border-[#1e3a5f] bg-[#0c1220]">
      <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center border border-cyan-500/50 bg-[#111827]">
            <Database className="size-4 text-cyan-400" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
              DynamoDB Write Throughput
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
              {stats.tableName} · live
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold tabular-nums text-cyan-400">
            {stats.writesThisHour}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            writes this hour
          </p>
        </div>
      </div>

      <div className="relative flex-1 p-5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="relative z-10 h-full w-full"
        >
          <polyline
            fill="none"
            stroke="rgb(34 211 238)"
            strokeWidth="1.5"
            points={polyline}
          />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-px border-t border-[#1e3a5f] bg-[#1e3a5f]">
        {[
          { label: "Partition key", value: "merchant_zone#hour" },
          { label: "GSI", value: `${stats.gsiName} (${stats.gsiStatus})` },
          { label: "Total items", value: String(stats.approximateItemCount) },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111827] px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>
            <p className="mt-1 font-mono text-xs text-slate-300">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DsqlNodeMap({ stats }: { stats: AdminStats["dsql"] }) {
  return (
    <div className="flex h-full flex-col border border-[#1e3a5f] bg-[#0c1220]">
      <div className="flex items-center justify-between border-b border-[#1e3a5f] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center border border-emerald-500/50 bg-[#111827]">
            <Globe2 className="size-4 text-emerald-400" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
              Aurora DSQL Active-Active State
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">
              multi-region · zero replication lag
            </p>
          </div>
        </div>
        <span className="border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
          Synced
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center p-8">
        <div className="border border-[#1e3a5f] bg-[#111827] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Billing-critical tables
          </p>
          <ul className="mt-3 space-y-2 font-mono text-xs text-slate-300">
            <li className="flex justify-between border-b border-[#1e3a5f] pb-2">
              <span>merchant_directory</span>
              <span className="text-emerald-400">{stats.merchantCount} rows</span>
            </li>
            <li className="flex justify-between border-b border-[#1e3a5f] pb-2">
              <span>agent_messages</span>
              <span className="text-emerald-400">
                {stats.pendingDrafts} pending
              </span>
            </li>
            <li className="flex justify-between">
              <span>subscriptions</span>
              <span className="text-emerald-400">
                {stats.subscriptionCount} rows
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#1e3a5f] px-5 py-3">
        <p className="text-center font-mono text-[10px] uppercase tracking-wider text-slate-500">
          Live counts from Aurora DSQL · polled every 10s
        </p>
      </div>
    </div>
  );
}

export default function AdminDemoPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as AdminStats;
        if (!cancelled) {
          setStats(data);
        }
      } catch {
        // keep last good stats
      }
    }

    load();
    const interval = setInterval(load, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="border-b border-[#1e3a5f] pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400">
          Hackathon demo
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">
          Live Database Panel
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Real-time view of DynamoDB ingest and Aurora DSQL multi-region state
        </p>
      </header>

      {!stats ? (
        <p className="text-sm text-slate-500">Loading database stats…</p>
      ) : (
        <div className="grid min-h-[560px] gap-px border border-[#1e3a5f] bg-[#1e3a5f] lg:grid-cols-2">
          <DynamoThroughputChart stats={stats.dynamodb} />
          <DsqlNodeMap stats={stats.dsql} />
        </div>
      )}
    </div>
  );
}
