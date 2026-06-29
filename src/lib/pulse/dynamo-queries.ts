import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, getDynamoTableName } from "@/lib/aws/dynamodb";
import type { ZoneDemand } from "@/lib/types/pulse";
import {
  currentHourKey,
  deltaPct,
  formatCategoryLabel,
  hourToIso,
  recentHourKeys,
} from "./hour-keys";

export function getTableName(): string {
  return process.env.DYNAMODB_TABLE_NAME ?? getDynamoTableName();
}

export async function queryPartition(
  partitionKey: string,
  tableName = getTableName(),
): Promise<Record<string, unknown>[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "#pk = :pk",
      ExpressionAttributeNames: {
        "#pk": "merchant_zone#hour",
      },
      ExpressionAttributeValues: {
        ":pk": partitionKey,
      },
    }),
  );

  return (result.Items ?? []) as Record<string, unknown>[];
}

function categoryCountsFromItems(
  items: Record<string, unknown>[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const item of items) {
    const categoryHour = item["category#hour"];
    if (typeof categoryHour !== "string") {
      continue;
    }
    const category = categoryHour.split("#")[0] ?? "unknown";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return counts;
}

export function aggregateZoneDemand(
  items: Record<string, unknown>[],
  zone: string,
  previousItems: Record<string, unknown>[] = [],
): ZoneDemand[] {
  const grouped = new Map<string, { txnCount: number; hour: string }>();
  const previousCounts = categoryCountsFromItems(previousItems);

  for (const item of items) {
    const partitionKey = item["merchant_zone#hour"];
    const categoryHour = item["category#hour"];

    if (typeof partitionKey !== "string" || typeof categoryHour !== "string") {
      continue;
    }

    const category = categoryHour.split("#")[0] ?? "unknown";
    const hour = partitionKey.split("#")[1] ?? currentHourKey();
    const existing = grouped.get(category);

    if (existing) {
      existing.txnCount += 1;
    } else {
      grouped.set(category, { txnCount: 1, hour });
    }
  }

  return Array.from(grouped.entries()).map(([category, stats]) => ({
    zone,
    hour: hourToIso(stats.hour),
    category: formatCategoryLabel(category),
    txnCount: stats.txnCount,
    deltaPct: deltaPct(stats.txnCount, previousCounts.get(category) ?? 0),
  }));
}

export async function queryZoneDemandWithDelta(
  zone: string,
  tableName = getTableName(),
): Promise<{ hourKey: string; demand: ZoneDemand[] } | null> {
  const hourKeys = recentHourKeys(3);

  for (let index = 0; index < hourKeys.length; index += 1) {
    const hourKey = hourKeys[index]!;
    const items = await queryPartition(`${zone}#${hourKey}`, tableName);

    if (items.length === 0) {
      continue;
    }

    const previousHourKey = hourKeys[index + 1];
    const previousItems = previousHourKey
      ? await queryPartition(`${zone}#${previousHourKey}`, tableName)
      : [];

    return {
      hourKey,
      demand: aggregateZoneDemand(items, zone, previousItems),
    };
  }

  return null;
}

export async function isTableEmpty(tableName = getTableName()): Promise<boolean> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: tableName,
      Limit: 1,
      ProjectionExpression: "txn_id",
    }),
  );

  return (result.Items?.length ?? 0) === 0;
}

export async function countItemsInHour(
  zone: string,
  hourKey: string,
  tableName = getTableName(),
): Promise<number> {
  const items = await queryPartition(`${zone}#${hourKey}`, tableName);
  return items.length;
}
