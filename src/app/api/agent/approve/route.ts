import { NextResponse } from "next/server";
import { pool } from "@/lib/aws/dsql";

interface ApproveRequestBody {
  draftId?: string;
}

export async function POST(request: Request) {
  let body: ApproveRequestBody;

  try {
    body = (await request.json()) as ApproveRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { draftId } = body;
  if (!draftId || typeof draftId !== "string") {
    return NextResponse.json(
      { error: "draftId is required" },
      { status: 400 },
    );
  }

  try {
    await pool.query(
      "UPDATE agent_messages SET status = 'deployed' WHERE id = $1",
      [draftId],
    );

    return NextResponse.json({ status: "deployed" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to deploy agent message";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
