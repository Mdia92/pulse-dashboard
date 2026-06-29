import { randomUUID } from "crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { docClient } from "@/lib/aws/dynamodb";
import { normalizeCategory } from "@/lib/pulse/hour-keys";

interface MobileMoneyWebhookBody {
  zoneId?: unknown;
  item?: unknown;
  qty?: unknown;
  price?: unknown;
}

function currentHourKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}`;
}

function validateBody(body: MobileMoneyWebhookBody): {
  zoneId: string;
  item: string;
  qty: number;
  price: number;
} | null {
  if (
    typeof body.zoneId !== "string" ||
    body.zoneId.trim() === "" ||
    typeof body.item !== "string" ||
    body.item.trim() === "" ||
    typeof body.qty !== "number" ||
    typeof body.price !== "number"
  ) {
    return null;
  }

  return {
    zoneId: body.zoneId.trim(),
    item: body.item.trim(),
    qty: body.qty,
    price: body.price,
  };
}

export async function POST(request: Request) {
  let body: MobileMoneyWebhookBody;

  try {
    body = (await request.json()) as MobileMoneyWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = validateBody(body);
  if (!payload) {
    return NextResponse.json(
      {
        error:
          "Request body must include zoneId (string), item (string), qty (number), and price (number)",
      },
      { status: 400 },
    );
  }

  const tableName = process.env.DYNAMODB_TABLE_NAME;
  if (!tableName) {
    return NextResponse.json(
      { error: "DYNAMODB_TABLE_NAME is not configured" },
      { status: 500 },
    );
  }

  const hourKey = currentHourKey();
  const txnId = randomUUID();
  const category = normalizeCategory(payload.item);

  try {
    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          "merchant_zone#hour": `${payload.zoneId}#${hourKey}`,
          txn_id: txnId,
          "category#hour": `${category}#${hourKey}`,
          price: payload.price,
          qty: payload.qty,
        },
      }),
    );
  } catch (error) {
    console.error("[POST /api/webhooks/mobile-money] DynamoDB write failed:", {
      txnId,
      zoneId: payload.zoneId,
      error,
    });

    return NextResponse.json(
      { error: "Failed to persist transaction" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      status: "created",
      txnId,
      zoneId: payload.zoneId,
      hour: hourKey,
    },
    { status: 201 },
  );
}
