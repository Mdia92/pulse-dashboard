/**
 * DynamoDB client for the Pulse transaction event stream.
 * Single-table design: PK merchant_zone#hour, SK txn_id, GSI category#hour.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(
      `${name} environment variable is required but was not set.`,
    );
  }
  return value;
}

const region = requireEnv("AWS_REGION");
const client = new DynamoDBClient({ region });
export const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.DYNAMODB_TABLE_NAME ?? "pulse-events";

export function getDynamoTableName(): string {
  return tableName;
}

export function isDynamoConfigured(): boolean {
  return Boolean(process.env.AWS_REGION && process.env.DYNAMODB_TABLE_NAME);
}
