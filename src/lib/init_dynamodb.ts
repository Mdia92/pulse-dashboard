import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceInUseException,
  ResourceNotFoundException,
  UpdateTableCommand,
} from "@aws-sdk/client-dynamodb";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { GSI_CATEGORY_HOUR } from "./pulse/hour-keys";

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1);
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const GSI_DEFINITION = {
  IndexName: GSI_CATEGORY_HOUR,
  KeySchema: [
    { AttributeName: "category#hour", KeyType: "HASH" as const },
    { AttributeName: "txn_id", KeyType: "RANGE" as const },
  ],
  Projection: { ProjectionType: "ALL" as const },
};

async function ensureGsi(client: DynamoDBClient, tableName: string): Promise<void> {
  const described = await client.send(
    new DescribeTableCommand({ TableName: tableName }),
  );

  const existing = described.Table?.GlobalSecondaryIndexes ?? [];
  if (existing.some((index) => index.IndexName === GSI_CATEGORY_HOUR)) {
    console.log(`GSI "${GSI_CATEGORY_HOUR}" already exists on "${tableName}".`);
    return;
  }

  try {
    await client.send(
      new UpdateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [
          { AttributeName: "merchant_zone#hour", AttributeType: "S" },
          { AttributeName: "txn_id", AttributeType: "S" },
          { AttributeName: "category#hour", AttributeType: "S" },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: GSI_DEFINITION,
          },
        ],
      }),
    );
    console.log(`GSI "${GSI_CATEGORY_HOUR}" added to "${tableName}".`);
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log(`GSI "${GSI_CATEGORY_HOUR}" update in progress on "${tableName}".`);
      return;
    }
    throw error;
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const tableName = process.env.DYNAMODB_TABLE_NAME ?? "pulse_event_stream";
  const region = process.env.AWS_REGION ?? "eu-west-2";
  const client = new DynamoDBClient({ region });

  let tableExists = true;

  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`Table "${tableName}" already exists in ${region}.`);
  } catch (error) {
    if (!(error instanceof ResourceNotFoundException)) {
      throw error;
    }
    tableExists = false;
  }

  if (!tableExists) {
    await client.send(
      new CreateTableCommand({
        TableName: tableName,
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [
          { AttributeName: "merchant_zone#hour", KeyType: "HASH" },
          { AttributeName: "txn_id", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
          { AttributeName: "merchant_zone#hour", AttributeType: "S" },
          { AttributeName: "txn_id", AttributeType: "S" },
          { AttributeName: "category#hour", AttributeType: "S" },
        ],
        GlobalSecondaryIndexes: [GSI_DEFINITION],
      }),
    );
    console.log(`Created table "${tableName}" with GSI in ${region}.`);
    return;
  }

  await ensureGsi(client, tableName);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
