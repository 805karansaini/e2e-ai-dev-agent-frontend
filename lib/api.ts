export type TaskStatus =
  | "PENDING"
  | "PLANNING"
  | "READY"
  | "QUEUED"
  | "IN_PROGRESS"
  | "REVIEWING"
  | "PULL_REQUEST"
  | "DONE"
  | "FAILURE";

export type TaskType = "TASK" | "SUBTASK";

export interface AttachmentPath {
  filename: string;
  path: string;
}

export interface TaskRecord {
  id: number;
  task_id: string;
  sub_task_id?: string | null;
  task_type: TaskType;
  description?: string | null;
  summary?: string | null;
  repo_url?: string | null;
  base_branch?: string | null;
  status: TaskStatus;
  prompt?: string | null;
  agent_summary?: string | null;
  attachment_path?: AttachmentPath[] | null;
  additional_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  tasks: TaskRecord[];
  total: number;
  skip: number;
  limit?: number | null;
}

export interface CreateTaskPayload {
  task_id: string;
  description?: string;
  summary?: string;
  repo_url?: string;
  base_branch?: string;
  status?: TaskStatus;
  prompt?: string;
  agent_summary?: string;
  attachment_path?: AttachmentPath[];
  additional_json?: Record<string, unknown>;
}

export interface CreateSubTaskPayload extends Omit<CreateTaskPayload, "task_id"> {
  task_id: string;
  sub_task_id: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  task_type?: TaskType;
}

export interface UpdateSubTaskPayload extends Partial<CreateSubTaskPayload> {
  task_type?: TaskType;
}

export interface JiraImportPayload {
  jira_task_id: string;
  repo_url: string;
  branch: string;
}

export interface TaskRunPayload {
  task_id: string;
  repo_url: string;
  base_branch?: string;
}

/**
 * Demo branch default: run fully frontend-only with mocked data.
 *
 * To opt out (e.g. when running the real backend locally), set:
 * NEXT_PUBLIC_DEMO_MODE=false
 */
export const IS_DEMO_MODE =
  (process.env.NEXT_PUBLIC_DEMO_MODE ?? "true").trim().toLowerCase() !== "false";

let apiBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();

if (!apiBaseUrl && typeof window !== "undefined") {
  const { protocol, hostname } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocal) {
    apiBaseUrl = `${protocol}//${hostname}:8080`;
  }
}

function buildUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (!apiBaseUrl) return path; // use same-origin relative path
  const base = apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (IS_DEMO_MODE) {
    throw new Error("Demo mode: backend requests are disabled in this build.")
  }
  const response = await fetch(buildUrl(path), {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(text || "Unexpected response from server");
    }
  }

  if (!response.ok) {
    const parsed = json as { message?: string; detail?: string } | null;
    const message = parsed?.message || parsed?.detail || response.statusText;
    throw new Error(message || "Request failed");
  }

  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data;
  }

  return json as T;
}

export const API_BASE_URL = apiBaseUrl || "relative";

export async function listTasks(): Promise<TaskRecord[]> {
  if (IS_DEMO_MODE) {
    const { readDemoTasks } = await import("@/lib/demo/storage");
    return readDemoTasks();
  }
  const data = await apiFetch<TaskListResponse>("/db/tasks?limit=1000");
  return data.tasks;
}

export async function createTask(payload: CreateTaskPayload): Promise<TaskRecord> {
  if (IS_DEMO_MODE) {
    const { createDemoTask } = await import("@/lib/demo/storage");
    return createDemoTask(payload);
  }
  return apiFetch<TaskRecord>("/db/tasks", {
    method: "POST",
    body: JSON.stringify({ ...payload, task_type: "TASK" }),
  });
}

export async function createSubTask(
  payload: CreateSubTaskPayload,
): Promise<TaskRecord> {
  if (IS_DEMO_MODE) {
    const { createDemoSubTask } = await import("@/lib/demo/storage");
    return createDemoSubTask(payload);
  }
  return apiFetch<TaskRecord>("/db/tasks/sub-task", {
    method: "POST",
    body: JSON.stringify({ ...payload, task_type: "SUBTASK" }),
  });
}

export async function updateTaskRecord(
  taskId: string,
  payload: UpdateTaskPayload,
): Promise<TaskRecord> {
  if (IS_DEMO_MODE) {
    const { updateDemoTaskRecord } = await import("@/lib/demo/storage");
    return updateDemoTaskRecord(taskId, payload);
  }
  return apiFetch<TaskRecord>(`/db/tasks/${encodeURIComponent(taskId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateSubTaskRecord(
  subTaskId: string,
  payload: UpdateSubTaskPayload,
): Promise<TaskRecord> {
  if (IS_DEMO_MODE) {
    const { updateDemoSubTaskRecord } = await import("@/lib/demo/storage");
    return updateDemoSubTaskRecord(subTaskId, payload);
  }
  return apiFetch<TaskRecord>(`/db/tasks/sub-task/${encodeURIComponent(subTaskId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function importTaskFromJira(
  payload: JiraImportPayload,
): Promise<TaskRecord> {
  if (IS_DEMO_MODE) {
    const { importDemoTaskFromJira } = await import("@/lib/demo/storage");
    return importDemoTaskFromJira(payload);
  }
  return apiFetch<TaskRecord>("/db/tasks/import-from-jira", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function orchestrateTask(payload: TaskRunPayload) {
  if (IS_DEMO_MODE) {
    const { demoOrchestrateTask } = await import("@/lib/demo/storage");
    return demoOrchestrateTask(payload);
  }
  return apiFetch("/tasks/orchestrator", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function startTask(payload: TaskRunPayload) {
  if (IS_DEMO_MODE) {
    const { demoStartTask } = await import("@/lib/demo/storage");
    return demoStartTask(payload);
  }
  return apiFetch("/tasks/start", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function autoTask(payload: TaskRunPayload) {
  if (IS_DEMO_MODE) {
    const { demoAutoTask } = await import("@/lib/demo/storage");
    return demoAutoTask(payload);
  }
  return apiFetch("/tasks/auto", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
