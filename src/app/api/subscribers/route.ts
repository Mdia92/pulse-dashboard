import { NextResponse } from "next/server";
import { pool } from "@/lib/aws/dsql";
import { MOCK_DASHBOARD_DATA } from "@/lib/types/pulse";

interface SubscriberRow {
  id: string;
  name: string;
  zone: string;
  status: string;
  since: string;
}

export async function GET() {
  try {
    const result = await pool.query<SubscriberRow>(
      `SELECT m.id, m.name, m.zone, s.status, m.since
       FROM merchant_directory m
       JOIN subscriptions s ON s.merchant_id = m.id
       ORDER BY m.name`,
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        source: "mock",
        subscribers: MOCK_DASHBOARD_DATA.merchants.map((merchant) => ({
          id: merchant.id,
          name: merchant.id,
          zone: merchant.zone,
          status: merchant.subscriptionStatus,
          since: "—",
        })),
      });
    }

    return NextResponse.json({
      source: "dsql",
      subscribers: result.rows,
    });
  } catch (error) {
    console.error("[GET /api/subscribers] DSQL query failed:", error);

    return NextResponse.json({
      source: "mock",
      subscribers: MOCK_DASHBOARD_DATA.merchants.map((merchant) => ({
        id: merchant.id,
        name: merchant.id,
        zone: merchant.zone,
        status: merchant.subscriptionStatus,
        since: "—",
      })),
    });
  }
}
