import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

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

async function main(): Promise<void> {
  loadEnvLocal();

  const { pool } = await import("./aws/dsql");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_messages (
      id VARCHAR(50) PRIMARY KEY,
      status VARCHAR(20),
      message TEXT,
      recipients INT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS merchant_directory (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      zone VARCHAR(100) NOT NULL,
      phone VARCHAR(30),
      since VARCHAR(20)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      merchant_id VARCHAR(50) PRIMARY KEY,
      status VARCHAR(20) NOT NULL,
      plan_fcfa INT DEFAULT 7000
    )
  `);

  await pool.query(
    `
    INSERT INTO agent_messages (id, status, message, recipients)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO UPDATE
    SET status = EXCLUDED.status,
        message = EXCLUDED.message,
        recipients = EXCLUDED.recipients
    `,
    [
      "draft-001",
      "pending",
      "Hello! Beverage sales are surging in the North District today. Visit us before closing and show this message at checkout for $5 off your next purchase. Thank you for your continued support.",
      84,
    ],
  );

  const merchants = [
    ["MCH-001", "Fatou Diop", "Almadies", "+221 77 000 0001", "Mar 2026"],
    ["MCH-002", "Amadou Sow", "Plateau", "+221 77 000 0002", "Jun 2026"],
    ["MCH-003", "Aissatou Ba", "Medina", "+221 77 000 0003", "Jan 2026"],
    ["MCH-004", "Ibrahima Ndiaye", "Almadies", "+221 77 000 0004", "Nov 2025"],
  ] as const;

  for (const [id, name, zone, phone, since] of merchants) {
    await pool.query(
      `
      INSERT INTO merchant_directory (id, name, zone, phone, since)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name,
          zone = EXCLUDED.zone,
          phone = EXCLUDED.phone,
          since = EXCLUDED.since
      `,
      [id, name, zone, phone, since],
    );
  }

  const subscriptions = [
    ["MCH-001", "active"],
    ["MCH-002", "trial"],
    ["MCH-003", "active"],
    ["MCH-004", "past_due"],
  ] as const;

  for (const [merchantId, status] of subscriptions) {
    await pool.query(
      `
      INSERT INTO subscriptions (merchant_id, status, plan_fcfa)
      VALUES ($1, $2, 7000)
      ON CONFLICT (merchant_id) DO UPDATE
      SET status = EXCLUDED.status,
          plan_fcfa = EXCLUDED.plan_fcfa
      `,
      [merchantId, status],
    );
  }

  console.log(
    "DSQL schema ready: agent_messages, merchant_directory, subscriptions seeded.",
  );
  await pool.end();
}

main().catch((error: unknown) => {
  console.error("DSQL init failed:", error);
  process.exit(1);
});
