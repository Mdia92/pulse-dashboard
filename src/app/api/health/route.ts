import { NextResponse } from "next/server";
import { isDynamoConfigured } from "@/lib/aws/dynamodb";
import { isDsqlConfigured } from "@/lib/aws/dsql";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "pulse-dashboard",
    aws: {
      dynamodb: isDynamoConfigured(),
      dsql: isDsqlConfigured(),
    },
  });
}
