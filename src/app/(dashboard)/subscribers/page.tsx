"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Subscriber {
  id: string;
  name: string;
  zone: string;
  status: string;
  since: string;
}

interface SubscribersResponse {
  source: "dsql" | "mock";
  subscribers: Subscriber[];
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/subscribers");
        if (!response.ok) {
          throw new Error("Subscribers API request failed");
        }
        const data = (await response.json()) as SubscribersResponse;
        if (!cancelled) {
          setSubscribers(data.subscribers);
        }
      } catch {
        if (!cancelled) {
          setSubscribers([]);
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

  return (
    <div className="space-y-6">
      <header className="border-b border-[#1e3a5f] pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
          Subscribers
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Merchant directory · 7,000 FCFA/month · Aurora DSQL
        </p>
      </header>

      <div className="border border-[#1e3a5f] bg-[#111827]">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading merchant directory…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e3a5f] hover:bg-transparent">
                <TableHead className="text-slate-500">Merchant</TableHead>
                <TableHead className="text-slate-500">Zone</TableHead>
                <TableHead className="text-slate-500">Status</TableHead>
                <TableHead className="text-slate-500">Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((sub) => (
                <TableRow
                  key={sub.id}
                  className="border-[#1e3a5f] hover:bg-[#141d2e]"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-200">{sub.name}</p>
                      <p className="font-mono text-xs text-slate-500">{sub.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">{sub.zone}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        sub.status === "active"
                          ? "rounded-none border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : sub.status === "trial"
                            ? "rounded-none border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                            : "rounded-none border-amber-500/40 bg-amber-500/10 text-amber-400"
                      }
                    >
                      {sub.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400">{sub.since}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
