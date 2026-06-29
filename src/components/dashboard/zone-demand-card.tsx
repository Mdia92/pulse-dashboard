interface ZoneDemandCardProps {
  zone: string;
  category: string;
  txnCount: number;
  deltaPct: number;
}

export function ZoneDemandCard({
  zone,
  category,
  txnCount,
  deltaPct,
}: ZoneDemandCardProps) {
  const isUp = deltaPct >= 0;

  return (
    <article className="border border-[#1e3a5f] bg-[#111827] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
        {zone}
      </p>
      <h3 className="mt-1 font-medium text-slate-100">{category}</h3>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-cyan-400">
        {txnCount}
      </p>
      <p
        className={`mt-1 text-sm tabular-nums ${isUp ? "text-emerald-400" : "text-rose-400"}`}
      >
        {isUp ? "+" : ""}
        {deltaPct}% vs last hour
      </p>
    </article>
  );
}
