import "server-only";
import sql from "@/lib/db";

const REFRESH_EVERY_N_MESSAGES = 10;
const MAX_SUMMARY_LENGTH = 1500;

export async function getUserMemory(userId: string): Promise<string> {
  try {
    const rows = await sql`SELECT summary FROM user_memory WHERE user_id = ${userId} LIMIT 1`;
    return rows[0]?.summary ?? "";
  } catch {
    return "";
  }
}

export async function bumpMessageCount(userId: string): Promise<{ count: number; summary: string }> {
  const rows = await sql`
    INSERT INTO user_memory (user_id, message_count, updated_at)
    VALUES (${userId}, 1, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      message_count = user_memory.message_count + 1,
      updated_at = NOW()
    RETURNING message_count, summary
  `;
  return { count: rows[0].message_count as number, summary: (rows[0].summary as string) ?? "" };
}

export function shouldRefreshMemory(count: number): boolean {
  return count > 0 && count % REFRESH_EVERY_N_MESSAGES === 0;
}

export async function saveUserMemory(userId: string, summary: string): Promise<void> {
  const trimmed = summary.trim().slice(0, MAX_SUMMARY_LENGTH);
  await sql`
    INSERT INTO user_memory (user_id, summary, updated_at)
    VALUES (${userId}, ${trimmed}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET summary = ${trimmed}, updated_at = NOW()
  `;
}
