import { randomUUID } from "crypto";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/aws/dynamodb";

const SYSTEM_INSTRUCTION =
  "Extract the transaction items, quantities, and prices from this handwritten merchant ledger. Return ONLY a valid JSON array of objects with the keys: item, qty, price, and timestamp.";

const NOVA_MODEL_ID = "amazon.nova-lite-v1:0";
const BEDROCK_REGION = "us-west-2";

interface LedgerLineItem {
  item: string;
  qty: number;
  price: number;
  timestamp: string;
}

interface NovaInvokeResponse {
  output?: {
    message?: {
      content?: Array<{ text?: string }>;
    };
  };
}

export interface PaperLedgerIngestResult {
  success: true;
  zoneId: string;
  itemsIngested: number;
  txnIds: string[];
}

const bedrockClient = new BedrockRuntimeClient({ region: BEDROCK_REGION });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(
      `${name} environment variable is required but was not set.`,
    );
  }
  return value;
}

function formatHourKey(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ledger timestamp: ${isoTimestamp}`);
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}`;
}

function normalizeCategory(item: string): string {
  return item.trim().toLowerCase().replace(/\s+/g, "_");
}

function parseLedgerResponse(raw: string): LedgerLineItem[] {
  const trimmed = raw.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    console.error("[processPaperLedger] Failed to parse Bedrock JSON response:", {
      rawPreview: jsonText.slice(0, 500),
      error,
    });
    throw error;
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Bedrock response is not a JSON array");
  }

  return parsed.map((entry, index) => {
    if (
      typeof entry !== "object" ||
      entry === null ||
      typeof (entry as LedgerLineItem).item !== "string" ||
      typeof (entry as LedgerLineItem).qty !== "number" ||
      typeof (entry as LedgerLineItem).price !== "number" ||
      typeof (entry as LedgerLineItem).timestamp !== "string"
    ) {
      throw new Error(`Invalid ledger item at index ${index}`);
    }

    return entry as LedgerLineItem;
  });
}

function extractNovaText(response: NovaInvokeResponse): string {
  return (
    response.output?.message?.content
      ?.map((block) => block.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

/**
 * Multi-modal ingestion pipeline: extract handwritten ledger rows via
 * Amazon Bedrock Nova Lite and write each transaction to DynamoDB.
 */
export async function processPaperLedger(
  imageBuffer: Buffer,
  zoneId: string,
): Promise<PaperLedgerIngestResult> {
  const tableName = requireEnv("DYNAMODB_TABLE_NAME");

  let responseText = "";

  try {
    console.info("[processPaperLedger] Invoking Bedrock Nova model", {
      modelId: NOVA_MODEL_ID,
      region: BEDROCK_REGION,
      zoneId,
      imageBytes: imageBuffer.length,
    });

    const invokeResponse = await bedrockClient.send(
      new InvokeModelCommand({
        modelId: NOVA_MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          schemaVersion: "messages-v1",
          system: [{ text: SYSTEM_INSTRUCTION }],
          messages: [
            {
              role: "user",
              content: [
                {
                  image: {
                    format: "jpeg",
                    source: {
                      bytes: imageBuffer.toString("base64"),
                    },
                  },
                },
                {
                  text: "Extract all transactions from this merchant ledger.",
                },
              ],
            },
          ],
          inferenceConfig: {
            maxTokens: 2048,
            temperature: 0.1,
          },
        }),
      }),
    );

    if (!invokeResponse.body) {
      throw new Error("Bedrock returned an empty response body");
    }

    const responsePayload = JSON.parse(
      new TextDecoder().decode(invokeResponse.body),
    ) as NovaInvokeResponse;

    responseText = extractNovaText(responsePayload);

    if (!responseText) {
      console.error(
        "[processPaperLedger] Empty text in Nova response:",
        responsePayload,
      );
      throw new Error("Bedrock returned an empty ledger extraction response");
    }

    console.info("[processPaperLedger] Nova extraction succeeded", {
      responseLength: responseText.length,
    });
  } catch (error) {
    console.error("[processPaperLedger] Bedrock Nova invoke failed:", error);
    throw error;
  }

  const ledgerItems = parseLedgerResponse(responseText);
  const txnIds: string[] = [];

  console.info("[processPaperLedger] Writing ledger items to DynamoDB", {
    tableName,
    itemCount: ledgerItems.length,
  });

  for (const line of ledgerItems) {
    const hourKey = formatHourKey(line.timestamp);
    const txnId = randomUUID();
    const category = normalizeCategory(line.item);

    try {
      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            "merchant_zone#hour": `${zoneId}#${hourKey}`,
            txn_id: txnId,
            "category#hour": `${category}#${hourKey}`,
            price: line.price,
            qty: line.qty,
          },
        }),
      );

      txnIds.push(txnId);
    } catch (error) {
      console.error("[processPaperLedger] DynamoDB PutCommand failed:", {
        txnId,
        zoneId,
        hourKey,
        category,
        error,
      });
      throw error;
    }
  }

  console.info("[processPaperLedger] Ingest complete", {
    zoneId,
    itemsIngested: ledgerItems.length,
    txnIds,
  });

  return {
    success: true,
    zoneId,
    itemsIngested: ledgerItems.length,
    txnIds,
  };
}
