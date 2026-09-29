import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Runs before the test module graph is imported. That ordering matters:
 * `lib/milo.ts` constructs the Groq client at module load, so GROQ_API_KEY has
 * to already be in process.env by then. Loading it inside the test file was too
 * late — ESM hoists imports above any statement.
 */
function loadEnvFile(path: string) {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return; // rely on the ambient environment
  }

  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const [, key, value] = match;
    if (process.env[key] === undefined) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));
