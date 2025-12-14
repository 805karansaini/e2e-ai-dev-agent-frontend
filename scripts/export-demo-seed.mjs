import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"

const repoRoot = resolve(new URL(".", import.meta.url).pathname, "..")
const dbPath = resolve(repoRoot, "tasks.db")
const outPath = resolve(repoRoot, "lib/demo/seed.ts")

function normalizeJsonField(v) {
  if (v === null || v === undefined) return null
  if (v === "null") return null
  if (typeof v !== "string") return v
  const s = v.trim()
  if (!s) return null
  if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
    try {
      return JSON.parse(s)
    } catch {
      return v
    }
  }
  return v
}

const raw = execFileSync("sqlite3", ["-json", dbPath, "SELECT * FROM tasks ORDER BY id DESC;"], {
  encoding: "utf8",
})

const rows = JSON.parse(raw)
const normalized = rows.map((r) => ({
  ...r,
  attachment_path: normalizeJsonField(r.attachment_path),
  additional_json: normalizeJsonField(r.additional_json),
}))

const content = `import type { TaskRecord } from "@/lib/api"

/**
 * Demo seed data exported from \`tasks.db\` (SQLite) to support a backend-free demo.
 *
 * Regenerate:
 *   npm run demo:export-seed
 */
export const DEMO_SEED_TASKS: TaskRecord[] = ${JSON.stringify(normalized, null, 2)}
`

writeFileSync(outPath, content, "utf8")
console.log(`Wrote ${normalized.length} rows -> ${outPath}`)
