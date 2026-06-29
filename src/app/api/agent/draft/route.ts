import { NextResponse } from "next/server";
import { pool } from "@/lib/aws/dsql";
import { MOCK_DASHBOARD_DATA } from "@/lib/types/pulse";
import type { AgentDraft } from "@/lib/types/pulse";

interface AgentMessageRow {
  id: string;
  status: string;
  message: string;
  recipients: number;
}

function rowToDraft(row: AgentMessageRow): AgentDraft {
  const status =
    row.status === "deployed"
      ? "sent"
      : row.status === "pending"
        ? "draft"
        : "approved";

  return {
    id: row.id,
    messageBody: row.message,
    recipientCount: row.recipients,
    status,
    createdAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const result = await pool.query<AgentMessageRow>(
      `SELECT id, status, message, recipients
       FROM agent_messages
       WHERE status = 'pending'
       ORDER BY id
       LIMIT 1`,
    );

    const row = result.rows[0];
    if (!row) {
      return NextResponse.json({
        source: "mock",
        draft: MOCK_DASHBOARD_DATA.agentDraft,
      });
    }

    return NextResponse.json({
      source: "dsql",
      draft: rowToDraft(row),
    });
  } catch (error) {
    console.error("[GET /api/agent/draft] DSQL query failed:", error);

    return NextResponse.json({
      source: "mock",
      draft: MOCK_DASHBOARD_DATA.agentDraft,
    });
  }
}
