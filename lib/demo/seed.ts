import type { TaskRecord } from "@/lib/api"

/**
 * Demo seed data exported from `tasks.db` (SQLite) to support a backend-free demo.
 *
 * Regenerate:
 *   npm run demo:export-seed
 */
export const DEMO_SEED_TASKS: TaskRecord[] = [
  {
    "id": 3,
    "task_id": "KAN-10",
    "sub_task_id": "KAN-12",
    "task_type": "SUBTASK",
    "repo_url": "https://github.com/805karansaini/e2e-ai-dev-agent/",
    "base_branch": "main",
    "status": "DONE",
    "summary": "Remove Verified Dead Code and Validate App",
    "description": "Remove only the confirmed safe-to-delete code identified by Vulture and perform a basic sanity check to ensure the FastAPI application remains intact and functional.",
    "attachment_path": null,
    "prompt": "Parent: KAN-10 - Remove only the dead-code items listed as 100% safe by KAN-11, applying deletions described in vulture_kan11_report.json. Then perform a basic sanity check by starting the FastAPI application and ensuring startup completes without errors. Acceptance criteria: only items from vulture_kan11_report.json are removed; the application starts with no runtime errors and basic startup checks pass.",
    "agent_summary": "Successfully removed dead code items from vulture_kan11_report.json: removed unused variables 'exc_type' and 'tb' from src/service/jira/client.py's __aexit__ method. Performed basic sanity check by starting FastAPI application on port 8001 which completed startup without errors. Application logs confirm successful creation and task runner initialization.",
    "additional_json": null,
    "created_at": "2025-12-14 14:13:11",
    "updated_at": "2025-12-14 14:18:58"
  },
  {
    "id": 2,
    "task_id": "KAN-10",
    "sub_task_id": "KAN-11",
    "task_type": "SUBTASK",
    "repo_url": "https://github.com/805karansaini/e2e-ai-dev-agent/",
    "base_branch": "main",
    "status": "DONE",
    "summary": "Run Vulture Analysis with Safe Configuration",
    "description": "Using Vulture library on the\nsrc/\ndirectory to detect unused code. Ensure settings minimize false positives and capture only high-confidence (100%) dead code.",
    "attachment_path": null,
    "prompt": "Parent: KAN-10 - Identify unused code in src/ using Vulture with safe configuration and generate a report listing only high-confidence (100%) dead-code candidates. The task must produce a verifiable artifact (e.g., vulture_kan11_report.json) and must not modify any source files. Acceptance criteria: the report contains only 100%‑confidence items, is saved at the repository root, and no code changes are made.",
    "agent_summary": "Successfully completed Subtask KAN-11: Identified unused code in src/ using Vulture with safe configuration and generated a report listing only high-confidence (100%) dead-code candidates. The report has been saved as vulture_kan11_report.json at the repository root with no modifications to source files. The report contains two unused variables in src/service/jira/client.py (lines 83): 'exc_type' and 'tb', both with 100% confidence.",
    "additional_json": null,
    "created_at": "2025-12-14 14:13:11",
    "updated_at": "2025-12-14 14:16:37"
  },
  {
    "id": 1,
    "task_id": "KAN-10",
    "sub_task_id": null,
    "task_type": "TASK",
    "repo_url": "https://github.com/805karansaini/e2e-ai-dev-agent/",
    "base_branch": "main",
    "status": "DONE",
    "summary": "Safely Remove Dead Code from FastAPI Codebase Using Vulture",
    "description": "Jira task KAN-10: Safely Remove Dead Code from FastAPI Codebase Using Vulture\n            Description:\n            Identify and remove unused (“ghost”) code from the\nsrc/\nFastAPI repository using static analysis. Only code that is 100% safe to remove should be deleted to avoid any functional or behavioral changes.\n\n            Attachments: No attachments downloaded.",
    "attachment_path": null,
    "prompt": "Parent: KAN-10 - Objective: Safely remove dead code from the FastAPI project using Vulture, ensuring only 100% safe-to-delete code is removed. Subtask KAN-11 will perform a high-confidence analysis to identify such code in src/ and produce a verifiable report; Subtask KAN-12 will apply removals from that report and perform a basic sanity check of the app. Constraints include limiting analysis to src/, avoiding behavioral changes, and keeping all findings auditable. Ordering: complete KAN-11 before KAN-12 and document the results for traceability.",
    "agent_summary": "## KAN-11\nSuccessfully completed Subtask KAN-11: Identified unused code in src/ using Vulture with safe configuration and generated a report listing only high-confidence (100%) dead-code candidates. The report has been saved as vulture_kan11_report.json at the repository root with no modifications to source files. The report contains two unused variables in src/service/jira/client.py (lines 83): 'exc_type' and 'tb', both with 100% confidence.\n\n## KAN-12\nSuccessfully removed dead code items from vulture_kan11_report.json: removed unused variables 'exc_type' and 'tb' from src/service/jira/client.py's __aexit__ method. Performed basic sanity check by starting FastAPI application on port 8001 which completed startup without errors. Application logs confirm successful creation and task runner initialization.",
    "additional_json": null,
    "created_at": "2025-12-14 14:13:11",
    "updated_at": "2025-12-14 14:23:30"
  }
]
