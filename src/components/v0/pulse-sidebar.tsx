"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertTriangle, Database, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Live Zone", icon: Activity },
  { href: "/anomalies", label: "Anomalies", icon: AlertTriangle },
  { href: "/agent", label: "Agent", icon: MessageSquare },
  { href: "/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin", label: "DB Panel", icon: Database },
];

export function PulseSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[#1e3a5f] bg-[#0c1220]">
      <div className="border-b border-[#1e3a5f] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Pulse
        </p>
        <h1 className="mt-1 text-base font-semibold text-slate-100">
          Demand Intelligence
        </h1>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[44px] items-center gap-3 border-l-2 px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-cyan-400 bg-[#141d2e] text-cyan-400"
                  : "border-transparent text-slate-400 hover:bg-[#141d2e] hover:text-slate-200",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[#1e3a5f] p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 bg-emerald-400" />
          <span className="text-xs text-slate-500">Live · Dakar zone</span>
        </div>
      </div>
    </aside>
  );
}
