"use client";

import { useState } from "react";
import type { AgentDraftStatus } from "@/lib/types/pulse";

const draftMessage =
  "Hi! Biscuits are flying off shelves in Almadies today. Show this message at checkout for 500 FCFA off your next purchase. — Your corner shop";

export function MessageDraft() {
  const [status, setStatus] = useState<AgentDraftStatus>("draft");

  return (
    <article className="max-w-lg rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-xs uppercase tracking-wide text-zinc-500">
        Draft · 84 customers
      </p>
      <p className="mt-4 text-sm leading-relaxed text-zinc-200">{draftMessage}</p>
      <div className="mt-6 flex items-center gap-3">
        {status === "draft" && (
          <button
            type="button"
            onClick={() => setStatus("approved")}
            className="min-h-[44px] bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Approve & send
          </button>
        )}
        {status === "approved" && (
          <button
            type="button"
            onClick={() => setStatus("sent")}
            className="min-h-[44px] bg-zinc-700 px-4 py-3 text-sm text-zinc-300"
          >
            Confirm send
          </button>
        )}
        {status === "sent" && (
          <p className="text-sm text-emerald-400">
            Sent to 84 customers via WhatsApp
          </p>
        )}
      </div>
    </article>
  );
}
