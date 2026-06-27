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
    <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{zone}</p>
      <h3 className="mt-1 font-medium text-zinc-100">{category}</h3>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{txnCount}</p>
      <p
        className={`mt-1 text-sm tabular-nums ${isUp ? "text-emerald-400" : "text-rose-400"}`}
      >
        {isUp ? "+" : ""}
        {deltaPct}% vs last hour
      </p>
    </article>
  );
}
