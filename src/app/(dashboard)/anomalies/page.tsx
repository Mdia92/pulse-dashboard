import { AnomalyList } from "@/components/dashboard/anomaly-list";

export default function AnomaliesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Anomalies</h2>
        <p className="text-sm text-zinc-400">
          Demand spikes and restock signals in your zone
        </p>
      </header>
      <AnomalyList />
    </div>
  );
}
