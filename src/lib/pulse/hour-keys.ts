export const DEFAULT_ZONE = "North District";
export const HOUR_LOOKBACK = 3;
export const GSI_CATEGORY_HOUR = "category-hour-index";

export function hourKeyFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}`;
}

export function currentHourKey(): string {
  return hourKeyFromDate(new Date());
}

export function recentHourKeys(count: number): string[] {
  const keys: string[] = [];
  const now = Date.now();

  for (let offset = 0; offset < count; offset += 1) {
    keys.push(hourKeyFromDate(new Date(now - offset * 60 * 60 * 1000)));
  }

  return keys;
}

export function hourToIso(hourKey: string): string {
  if (hourKey.length === 10) {
    return `${hourKey}T00:00:00Z`;
  }
  return `${hourKey}:00:00Z`;
}

export function formatCategoryLabel(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeCategory(item: string): string {
  return item.trim().toLowerCase().replace(/\s+/g, "_");
}

export function deltaPct(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export function anomalySeverity(deltaPct: number): "low" | "medium" | "high" {
  const magnitude = Math.abs(deltaPct);
  if (magnitude >= 100) {
    return "high";
  }
  if (magnitude >= 25) {
    return "medium";
  }
  return "low";
}
