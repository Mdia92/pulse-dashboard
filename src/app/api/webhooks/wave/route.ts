import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  // Stub: ingest mobile money webhook payload into DynamoDB event stream
  return NextResponse.json(
    {
      received: true,
      message: "Webhook stub — wire to DynamoDB PutItem",
      payloadKeys: body ? Object.keys(body) : [],
    },
    { status: 202 },
  );
}
