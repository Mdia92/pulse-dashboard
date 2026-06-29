import { NextResponse } from "next/server";
import {
  MOCK_DASHBOARD_DATA,
  type ZoneDemand,
} from "@/lib/types/pulse";
import { DEFAULT_ZONE } from "@/lib/pulse/hour-keys";
import {
  isTableEmpty,
  queryZoneDemandWithDelta,
} from "@/lib/pulse/dynamo-queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zone = searchParams.get("zone") ?? DEFAULT_ZONE;

  try {
    const result = await queryZoneDemandWithDelta(zone);

    if (result && result.demand.length > 0) {
      return NextResponse.json({
        source: "dynamodb",
        zoneDemand: result.demand,
      });
    }

    const tableEmpty = await isTableEmpty();
    if (tableEmpty) {
      return NextResponse.json({
        source: "mock",
        zoneDemand: MOCK_DASHBOARD_DATA.zoneDemand,
      });
    }

    return NextResponse.json({
      source: "dynamodb",
      zoneDemand: [] as ZoneDemand[],
    });
  } catch (error) {
    console.error("[GET /api/demand] DynamoDB query failed, using mock fallback:", {
      zone,
      error,
    });

    return NextResponse.json({
      source: "mock",
      zoneDemand: MOCK_DASHBOARD_DATA.zoneDemand,
    });
  }
}
