import type { Anomaly } from "@/lib/types/pulse";
import {
  anomalySeverity,
  DEFAULT_ZONE,
  deltaPct,
  formatCategoryLabel,
  recentHourKeys,
} from "./hour-keys";
import { aggregateZoneDemand, queryPartition } from "./dynamo-queries";

export async function detectZoneAnomalies(
  zone: string = DEFAULT_ZONE,
): Promise<Anomaly[]> {
  const hourKeys = recentHourKeys(2);
  const currentHour = hourKeys[0]!;
  const previousHour = hourKeys[1]!;

  const [currentItems, previousItems] = await Promise.all([
    queryPartition(`${zone}#${currentHour}`),
    queryPartition(`${zone}#${previousHour}`),
  ]);

  if (currentItems.length === 0) {
    return [];
  }

  const currentDemand = aggregateZoneDemand(currentItems, zone, previousItems);

  return currentDemand
    .filter((item) => item.deltaPct !== 0)
    .sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
    .map((item, index) => {
      const sku = item.category.toLowerCase().replace(/\s+/g, "_");
      const direction = item.deltaPct >= 0 ? "up" : "down";
      const magnitude = Math.abs(item.deltaPct);

      let message: string;
      if (item.deltaPct >= 100) {
        message = `${item.category} sales up ${magnitude}% in your zone — restock now`;
      } else if (item.deltaPct <= -25) {
        message = `${item.category} demand down ${magnitude}% — consider a targeted discount`;
      } else if (item.deltaPct > 0) {
        message = `${item.category} trending ${direction} ${magnitude}% vs last hour`;
      } else {
        message = `${item.category} purchases shifting ${magnitude}% vs last hour`;
      }

      return {
        id: `anom-${zone}-${sku}-${index}`,
        message,
        severity: anomalySeverity(item.deltaPct),
        sku,
        zone,
        deltaPct: item.deltaPct,
      };
    });
}

export function formatAnomalySku(category: string): string {
  return formatCategoryLabel(category).toLowerCase().replace(/\s+/g, "_");
}
