import { ZoneDemandCard } from "@/components/dashboard/zone-demand-card";

const mockDemand = [
  { zone: "Almadies", category: "Biscuits", txnCount: 47, deltaPct: 240 },
  { zone: "Plateau", category: "Baby formula", txnCount: 23, deltaPct: 18 },
  { zone: "Médina", category: "Cooking oil", txnCount: 31, deltaPct: -12 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Zone demand</h2>
        <p className="text-sm text-zinc-400">
          Live sales within 500m — Dakar merchant view
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockDemand.map((item) => (
          <ZoneDemandCard key={`${item.zone}-${item.category}`} {...item} />
        ))}
      </div>
    </div>
  );
}
