"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MessageSquare, Radio, Users } from "lucide-react";
import type { AgentDraft } from "@/lib/types/pulse";

interface DraftResponse {
  source: "dsql" | "mock";
  draft: AgentDraft;
}

function DataRoutingAnimation({ recipientCount }: { recipientCount: number }) {
  return (
    <div className="border border-slate-700 bg-slate-800 p-6">
      <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
        Data routing · live
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex w-24 shrink-0 flex-col items-center gap-2">
          <div className="flex size-10 items-center justify-center border border-cyan-500/50 bg-slate-900">
            <Radio className="size-4 text-cyan-400" strokeWidth={1.75} />
          </div>
          <span className="text-center text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Pulse Agent
          </span>
        </div>

        <div className="relative h-px flex-1 bg-slate-600">
          <span className="data-route-packet absolute top-1/2 size-2 -translate-y-1/2 bg-green-500" />
          <span className="data-route-packet-delayed absolute top-1/2 size-2 -translate-y-1/2 bg-cyan-400" />
        </div>

        <div className="flex w-24 shrink-0 flex-col items-center gap-2">
          <div className="flex size-10 items-center justify-center border border-green-500/50 bg-slate-900">
            <MessageSquare className="size-4 text-green-400" strokeWidth={1.75} />
          </div>
          <span className="text-center text-[10px] font-medium uppercase tracking-wide text-slate-400">
            WhatsApp API
          </span>
        </div>

        <div className="relative h-px flex-1 bg-slate-600">
          <span className="data-route-packet absolute top-1/2 size-2 -translate-y-1/2 bg-green-500" />
        </div>

        <div className="flex w-24 shrink-0 flex-col items-center gap-2">
          <div className="flex size-10 items-center justify-center border border-green-500/50 bg-slate-900">
            <Users className="size-4 text-green-400" strokeWidth={1.75} />
          </div>
          <span className="text-center text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {recipientCount} recipients
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="relative h-12 w-px bg-slate-600">
          <span className="data-route-packet-vertical absolute left-1/2 size-2 -translate-x-1/2 bg-cyan-400" />
        </div>
      </div>
      <p className="mt-2 text-center font-mono text-xs text-slate-500">
        DynamoDB event logged · DSQL delivery queue confirmed
      </p>
    </div>
  );
}

export default function AgentPage() {
  const [draft, setDraft] = useState<AgentDraft | null>(null);
  const [deployed, setDeployed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      try {
        const response = await fetch("/api/agent/draft");
        if (!response.ok) {
          throw new Error("Draft API request failed");
        }
        const data = (await response.json()) as DraftResponse;
        if (!cancelled) {
          setDraft(data.draft);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDraft();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleApprove() {
    if (!draft || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/agent/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: draft.id }),
      });

      if (response.status !== 200) {
        throw new Error(
          `Agent approve failed: ${response.status} ${response.statusText}`,
        );
      }

      const payload = (await response.json()) as { status?: string };
      if (payload.status !== "deployed") {
        throw new Error("Agent approve failed: unexpected response payload");
      }

      setDeployed(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading || !draft) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center text-sm text-slate-500">
        Loading agent draft from DSQL…
      </div>
    );
  }

  const createdAt = new Date(draft.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="border-b border-slate-700 pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
          Agent
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          AI-drafted WhatsApp reactivation — approve with one tap
        </p>
      </header>

      {deployed ? (
        <div className="deploy-success-enter space-y-6">
          <div className="border border-green-500/40 bg-slate-800 p-8 shadow-[0_0_32px_rgba(34,197,94,0.12)]">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center border border-green-500 bg-green-500/10">
                <CheckCircle2
                  className="size-6 text-green-400"
                  strokeWidth={1.75}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400">
                  Message Deployed
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Delivered to {draft.recipientCount} customers via WhatsApp
                </p>
              </div>
            </div>
            <p className="mt-6 border-l-2 border-green-500/50 bg-slate-900 p-4 text-sm leading-relaxed text-slate-300">
              {draft.messageBody}
            </p>
          </div>

          <DataRoutingAnimation recipientCount={draft.recipientCount} />
        </div>
      ) : (
        <>
          <article className="border border-slate-700 bg-slate-800 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Pending draft
                </p>
                <p className="mt-1 text-xs text-slate-500">ID · {draft.id}</p>
              </div>
              <span className="border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                Awaiting approval
              </span>
            </div>

            <div className="mt-5 border border-slate-700 bg-slate-900 p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
                <MessageSquare
                  className="size-4 text-green-400"
                  strokeWidth={1.75}
                />
                <span className="text-xs font-medium text-slate-400">
                  WhatsApp Business · promotional message
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-200">
                {draft.messageBody}
              </p>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-700 pt-4 text-xs">
              <div>
                <dt className="uppercase tracking-wide text-slate-500">
                  Recipients
                </dt>
                <dd className="mt-1 font-mono text-slate-200">
                  {draft.recipientCount} customers
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide text-slate-500">
                  Created
                </dt>
                <dd className="mt-1 font-mono text-slate-200">{createdAt}</dd>
              </div>
            </dl>
          </article>

          <button
            type="button"
            onClick={handleApprove}
            disabled={isSubmitting}
            aria-label="Approve and send WhatsApp message"
            className="min-h-[44px] w-full border-2 border-green-400 bg-green-500 py-4 text-base font-bold uppercase tracking-widest text-slate-950 transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Deploying…" : "Approve & Send"}
          </button>
        </>
      )}
    </div>
  );
}
