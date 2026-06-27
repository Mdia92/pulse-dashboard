/**
 * Aurora DSQL client for merchant directory and subscription state.
 * Multi-region active-active writes for billing-critical merchant data.
 *
 * Aurora DSQL is PostgreSQL-compatible — use standard node-postgres (pg) drivers
 * to connect to the cluster endpoint.
 */

import { Pool } from "pg";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(
      `${name} environment variable is required but was not set.`,
    );
  }
  return value;
}

const clusterEndpoint = requireEnv("DSQL_CLUSTER_ENDPOINT");
export const pool = new Pool({
  host: clusterEndpoint,
  port: 5432,
});

export function getDsqlEndpoint(): string {
  return clusterEndpoint;
}

export function isDsqlConfigured(): boolean {
  return Boolean(process.env.DSQL_CLUSTER_ENDPOINT);
}
