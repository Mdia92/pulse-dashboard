/**
 * Aurora DSQL client for merchant directory and subscription state.
 * Multi-region active-active writes for billing-critical merchant data.
 *
 * Aurora DSQL is PostgreSQL-compatible — use the official node-postgres
 * connector for IAM authentication and mandatory SSL.
 */

import { AuroraDSQLPool } from "@aws/aurora-dsql-node-postgres-connector";

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
export const pool = new AuroraDSQLPool({
  host: clusterEndpoint,
  user: "admin",
  port: 5432,
  max: 3,
});

export function getDsqlEndpoint(): string {
  return clusterEndpoint;
}

export function isDsqlConfigured(): boolean {
  return Boolean(process.env.DSQL_CLUSTER_ENDPOINT);
}
