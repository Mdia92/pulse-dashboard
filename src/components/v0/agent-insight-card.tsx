import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AgentInsightCard() {
  return (
    <Card className="rounded-none border-2 border-cyan-400/60 bg-[#0c1220] shadow-[0_0_24px_rgba(34,211,238,0.08)]">
      <CardHeader className="border-b border-[#1e3a5f] pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center border border-emerald-400/50 bg-emerald-400/10">
            <Sparkles className="size-4 text-emerald-400" strokeWidth={1.75} />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-cyan-400">
              Agent Insight
            </CardTitle>
            <CardDescription className="text-slate-500">
              Unprogrammed pattern · Almadies zone
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <p className="text-sm leading-relaxed text-slate-200">
          Biscuit sales are up{" "}
          <span className="font-semibold text-emerald-400">240%</span> in your
          zone in the last hour — 3× the weekly average. Restock now and send a
          Wave promo to 84 dormant customers tonight.
        </p>
        <div className="flex items-center gap-3 border border-[#1e3a5f] bg-[#111827] p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Suggested action
          </span>
          <span className="text-sm text-slate-300">
            WhatsApp reactivation blast · 500 FCFA off
          </span>
        </div>
        <Link
          href="/agent"
          className="flex min-h-[44px] w-full items-center justify-center bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-400"
        >
          Review draft message
        </Link>
      </CardContent>
    </Card>
  );
}
