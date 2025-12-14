import type {
  CreateSubTaskPayload,
  CreateTaskPayload,
  JiraImportPayload,
  TaskRecord,
  TaskRunPayload,
  UpdateSubTaskPayload,
  UpdateTaskPayload,
} from "@/lib/api"
import { DEMO_SEED_TASKS } from "@/lib/demo/seed"

const STORAGE_KEY = "e2e-demo-tasks-v1"

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

function nowIso(): string {
  return new Date().toISOString()
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function getSeed(): TaskRecord[] {
  return clone(DEMO_SEED_TASKS)
}

export function readDemoTasks(): TaskRecord[] {
  if (!isBrowser()) return getSeed()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = getSeed()
      writeDemoTasks(seeded)
      return seeded
    }
    const parsed = JSON.parse(raw) as TaskRecord[]
    if (!Array.isArray(parsed)) return getSeed()
    return parsed
  } catch {
    return getSeed()
  }
}

function writeDemoTasks(tasks: TaskRecord[]) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // ignore
  }
}

function nextId(tasks: TaskRecord[]): number {
  const max = tasks.reduce((m, t) => Math.max(m, Number(t.id) || 0), 0)
  return max + 1
}

export function createDemoTask(payload: CreateTaskPayload): TaskRecord {
  const tasks = readDemoTasks()
  const record: TaskRecord = {
    id: nextId(tasks),
    task_id: payload.task_id,
    sub_task_id: null,
    task_type: "TASK",
    description: payload.description ?? "",
    summary: payload.summary ?? null,
    repo_url: payload.repo_url ?? null,
    base_branch: payload.base_branch ?? null,
    status: payload.status ?? "PENDING",
    prompt: payload.prompt ?? "",
    agent_summary: payload.agent_summary ?? null,
    attachment_path: payload.attachment_path ?? null,
    additional_json: payload.additional_json ?? null,
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  const next = [record, ...tasks]
  writeDemoTasks(next)
  return record
}

export function createDemoSubTask(payload: CreateSubTaskPayload): TaskRecord {
  const tasks = readDemoTasks()
  const record: TaskRecord = {
    id: nextId(tasks),
    task_id: payload.task_id,
    sub_task_id: payload.sub_task_id,
    task_type: "SUBTASK",
    description: payload.description ?? "",
    summary: payload.summary ?? null,
    repo_url: payload.repo_url ?? null,
    base_branch: payload.base_branch ?? null,
    status: payload.status ?? "PENDING",
    prompt: payload.prompt ?? "",
    agent_summary: payload.agent_summary ?? null,
    attachment_path: payload.attachment_path ?? null,
    additional_json: payload.additional_json ?? null,
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  const next = [record, ...tasks]
  writeDemoTasks(next)
  return record
}

export function updateDemoTaskRecord(taskId: string, payload: UpdateTaskPayload): TaskRecord {
  const tasks = readDemoTasks()
  const idx = tasks.findIndex((t) => t.task_id === taskId && !t.sub_task_id)
  if (idx < 0) throw new Error(`Demo: task not found: ${taskId}`)

  const prev = tasks[idx]
  const updated: TaskRecord = {
    ...prev,
    ...payload,
    task_id: prev.task_id,
    sub_task_id: null,
    task_type: prev.task_type,
    updated_at: nowIso(),
  }

  const next = tasks.slice()
  next[idx] = updated
  writeDemoTasks(next)
  return updated
}

export function updateDemoSubTaskRecord(subTaskId: string, payload: UpdateSubTaskPayload): TaskRecord {
  const tasks = readDemoTasks()
  const idx = tasks.findIndex((t) => t.sub_task_id === subTaskId)
  if (idx < 0) throw new Error(`Demo: subtask not found: ${subTaskId}`)

  const prev = tasks[idx]
  const updated: TaskRecord = {
    ...prev,
    ...payload,
    task_id: prev.task_id,
    sub_task_id: prev.sub_task_id,
    task_type: prev.task_type,
    updated_at: nowIso(),
  }

  const next = tasks.slice()
  next[idx] = updated
  writeDemoTasks(next)
  return updated
}

export function importDemoTaskFromJira(payload: JiraImportPayload): TaskRecord {
  // In demo mode we can't talk to Jira; we just create a placeholder task.
  return createDemoTask({
    task_id: payload.jira_task_id,
    summary: "Imported from Jira (demo)",
    description: "Demo placeholder. Run locally with the backend repo to enable real Jira import.",
    repo_url: payload.repo_url,
    base_branch: payload.branch,
    status: "PENDING",
    prompt: "",
  })
}

function updateStatusByActionId(actionTaskId: string, status: TaskRecord["status"], agent_summary?: string | null) {
  const tasks = readDemoTasks()
  const idx = tasks.findIndex((t) => t.sub_task_id === actionTaskId || (t.task_id === actionTaskId && !t.sub_task_id))
  if (idx < 0) throw new Error(`Demo: task not found: ${actionTaskId}`)

  const prev = tasks[idx]
  const nextRecord: TaskRecord = {
    ...prev,
    status,
    agent_summary: agent_summary ?? prev.agent_summary ?? null,
    updated_at: nowIso(),
  }

  const next = tasks.slice()
  next[idx] = nextRecord
  writeDemoTasks(next)
  return nextRecord
}

export async function demoOrchestrateTask(payload: TaskRunPayload) {
  updateStatusByActionId(
    payload.task_id,
    "PLANNING",
    "Demo mode: Orchestrator is mocked. Run the backend locally to enable real planning.",
  )
  await sleep(400)
  updateStatusByActionId(payload.task_id, "READY")
  return { ok: true }
}

export async function demoStartTask(payload: TaskRunPayload) {
  updateStatusByActionId(
    payload.task_id,
    "IN_PROGRESS",
    "Demo mode: Start task is mocked. Run the backend locally to enable real execution.",
  )
  return { ok: true }
}

export async function demoAutoTask(payload: TaskRunPayload) {
  updateStatusByActionId(
    payload.task_id,
    "QUEUED",
    "Demo mode: Auto-task is mocked. Run the backend locally to enable real automation.",
  )
  await sleep(500)
  updateStatusByActionId(payload.task_id, "DONE")
  return { ok: true }
}
