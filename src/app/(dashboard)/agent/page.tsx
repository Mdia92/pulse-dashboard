import { MessageDraft } from "@/components/agent/message-draft";

export default function AgentPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Agent</h2>
        <p className="text-sm text-zinc-400">
          AI-drafted WhatsApp reactivation — approve with one tap
        </p>
      </header>
      <MessageDraft />
    </div>
  );
}
