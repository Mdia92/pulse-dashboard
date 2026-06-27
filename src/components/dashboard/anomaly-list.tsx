import type { Anomaly } from "@/lib/types/pulse";

const mockAnomalies: Anomaly[] = [
  {
    id: "1",
    message: "Biscuit sales up 240% in your zone — restock now",
    severity: "high",
    sku: "biscuits",
    zone: "Almadies",
    deltaPct: 240,
  },
  {
    id: "2",
    message: "Baby formula purchases shifting 3 days earlier this month",
    severity: "medium",
    sku: "baby_formula",
    zone: "Almadies",
    deltaPct: 18,
  },
];

const severityStyles = {
  low: "border-zinc-700 text-zinc-400",
  medium: "border-amber-800 text-amber-400",
  high: "border-rose-800 text-rose-400",
};

export function AnomalyList() {
  return (
    <ul className="space-y-3">
      {mockAnomalies.map((anomaly) => (
        <li
          key={anomaly.id}
          className={`rounded-lg border bg-zinc-900 p-4 ${severityStyles[anomaly.severity]}`}
        >
          <p className="text-sm font-medium text-zinc-100">{anomaly.message}</p>
          <p className="mt-2 text-xs text-zinc-500">
            {anomaly.zone} · {anomaly.sku} · +{anomaly.deltaPct}%
          </p>
        </li>
      ))}
    </ul>
  );
}
