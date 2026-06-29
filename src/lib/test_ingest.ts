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

/** Minimal valid JPEG buffer for Bedrock vision pipeline smoke test. */
function createDummyImageBuffer(): Buffer {
  return Buffer.from(
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAQEBAVFhUVFRUVFRgXFxgXGBcYGBgYGBgYGBgdHSggGBolHRcVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAEBQAGAgMHAf/EADQQAAIBAwMDAwMDAwMFAAAAAAECAwQFEQYSITETQVEUImFxMoGRQrHB0fAjUmL/xAAZAQACAwEAAAAAAAAAAAAAAAABAgADBAUG/8QAHhEAAgICAgMBAAAAAAAAAAAAAQIAAxESITETQVFhcf/aAAwDAQACEQMRAD8A6pooooAKKKKACiiigAooooAKKKKACiiigD//Z",
    "base64",
  );
}

async function main(): Promise<void> {
  loadEnvLocal();

  const { processPaperLedger } = await import("./ingest_ledger");
  const imageBuffer = createDummyImageBuffer();

  console.log("Running paper ledger ingest for zone: North District");
  console.log(`Dummy image size: ${imageBuffer.length} bytes`);

  const result = await processPaperLedger(imageBuffer, "North District");
  console.log("Ingest complete:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error: unknown) => {
  console.error("Ledger ingest test failed:", error);
  process.exit(1);
});
