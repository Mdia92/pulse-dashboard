import Link from "next/link";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/anomalies", label: "Anomalies" },
  { href: "/agent", label: "Agent" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full bg-zinc-950 text-zinc-100">
      <aside className="w-56 shrink-0 border-r border-zinc-800 p-4">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Pulse
          </p>
          <h1 className="text-lg font-semibold">Demand Intelligence</h1>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
