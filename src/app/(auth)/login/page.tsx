"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phone.trim()) {
      return;
    }
    setCodeSent(true);
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[#0a0f1a] p-8">
      <div className="w-full max-w-md border border-[#1e3a5f] bg-[#0c1220] p-8 shadow-[0_0_48px_rgba(0,0,0,0.4)]">
        <div className="border-b border-[#1e3a5f] pb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Pulse
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-100">
            Merchant Login
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in with WhatsApp OTP — we&apos;ll send a one-time code to your
            business number.
          </p>
        </div>

        <form onSubmit={handleSendCode} className="mt-6 space-y-5">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Phone number
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+1 555 010 2000"
              className="mt-2 min-h-[44px] w-full border border-[#1e3a5f] bg-[#111827] px-4 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={!phone.trim()}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 border-2 border-green-400 bg-green-500 py-4 text-sm font-bold uppercase tracking-widest text-slate-950 transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle className="size-4" strokeWidth={2} />
            Send Code via WhatsApp
          </button>
        </form>

        {codeSent && (
          <p className="mt-5 border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-400">
            Code sent to {phone} — check WhatsApp to continue.
          </p>
        )}

        <p className="mt-6 text-center text-[10px] uppercase tracking-wider text-slate-600">
          B2B access · Demand intelligence platform
        </p>
      </div>
    </div>
  );
}
