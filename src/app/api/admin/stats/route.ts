import { DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NextResponse } from "next/server";
import { DEFAULT_ZONE, currentHourKey, GSI_CATEGORY_HOUR } from "@/lib/pulse/hour-keys";
import { countItemsInHour, getTableName } from "@/lib/pulse/dynamo-queries";
import { pool } from "@/lib/aws/dsql";

export async function GET() {
  const tableName = getTableName();
  const region = process.env.AWS_REGION ?? "eu-west-2";
  const hourKey = currentHourKey();

  try {
    const dynamoClient = new DynamoDBClient({ region });
    const [tableDesc, hourWrites, merchantCount, subscriptionCount, pendingDrafts] =
      await Promise.all([
        dynamoClient.send(new DescribeTableCommand({ TableName: tableName })),
        countItemsInHour(DEFAULT_ZONE, hourKey, tableName),
        pool.query<{ count: string }>(
          "SELECT COUNT(*)::text AS count FROM merchant_directory",
        ),
        pool.query<{ count: string }>(
          "SELECT COUNT(*)::text AS count FROM subscriptions",
        ),
        pool.query<{ count: string }>(
          "SELECT COUNT(*)::text AS count FROM agent_messages WHERE status = 'pending'",
        ),
      ]);

    const gsi = tableDesc.Table?.GlobalSecondaryIndexes?.find(
      (index) => index.IndexName === GSI_CATEGORY_HOUR,
    );

    return NextResponse.json({
      dynamodb: {
        tableName,
        approximateItemCount: tableDesc.Table?.ItemCount ?? 0,
        gsiName: GSI_CATEGORY_HOUR,
        gsiStatus: gsi?.IndexStatus ?? "MISSING",
        currentHour: hourKey,
        writesThisHour: hourWrites,
      },
      dsql: {
        merchantCount: Number(merchantCount.rows[0]?.count ?? 0),
        subscriptionCount: Number(subscriptionCount.rows[0]?.count ?? 0),
        pendingDrafts: Number(pendingDrafts.rows[0]?.count ?? 0),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/stats] stats query failed:", error);

    return NextResponse.json(
      { error: "Failed to load admin stats" },
      { status: 500 },
    );
  }
}
