import { PulseSidebar } from "@/components/v0/pulse-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full bg-[#0a0f1a] text-slate-100">
      <PulseSidebar />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
