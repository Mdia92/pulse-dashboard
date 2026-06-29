import { NextResponse } from "next/server";
import { detectZoneAnomalies } from "@/lib/pulse/anomalies";
import { DEFAULT_ZONE } from "@/lib/pulse/hour-keys";
import { MOCK_DASHBOARD_DATA } from "@/lib/types/pulse";
import { isTableEmpty } from "@/lib/pulse/dynamo-queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zone = searchParams.get("zone") ?? DEFAULT_ZONE;

  try {
    const anomalies = await detectZoneAnomalies(zone);

    if (anomalies.length > 0) {
      return NextResponse.json({ source: "dynamodb", anomalies });
    }

    const tableEmpty = await isTableEmpty();
    if (tableEmpty) {
      return NextResponse.json({
        source: "mock",
        anomalies: MOCK_DASHBOARD_DATA.anomalies,
      });
    }

    return NextResponse.json({ source: "dynamodb", anomalies: [] });
  } catch (error) {
    console.error("[GET /api/anomalies] DynamoDB query failed:", { zone, error });

    return NextResponse.json({
      source: "mock",
      anomalies: MOCK_DASHBOARD_DATA.anomalies,
    });
  }
}
