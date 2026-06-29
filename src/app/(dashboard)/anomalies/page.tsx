import { AnomalyList } from "@/components/dashboard/anomaly-list";

export default function AnomaliesPage() {
  return (
    <div className="space-y-6">
      <header className="border-b border-[#1e3a5f] pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
          Anomalies
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Demand spikes and restock signals in your zone
        </p>
      </header>
      <AnomalyList />
    </div>
  );
}
