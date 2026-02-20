# System & Data Architecture

To make this a true enterprise-grade desktop tool, the architecture must ensure the UI never freezes, even when the Rust backend is firing thousands of requests against an API.

## 1. Core Technology Stack
- **Frontend:** React + TypeScript + TailwindCSS + Monaco Editor.
- **Backend / Desktop Frame:** Tauri (Rust).
- **Communication:** Tauri IPC (Inter-Process Communication) and Rust Asynchronous Channels (`mpsc`).
- **Database:** Local SQLite (using `sqlx` in Rust).

---

## 2. Database Schema (SQLite)

We need a relational structure to store historical data locally on the analyst's machine.

### `workspaces`
Groups assets and findings together by project.
- `id` (UUID, Primary Key)
- `name` (String) - e.g., "Payments API v2"
- `created_at` (Timestamp)

### `api_assets`
The core inventory of endpoints.
- `id` (UUID, Primary Key)
- `workspace_id` (UUID, Foreign Key)
- `method` (String) - GET, POST, PUT, etc.
- `host` (String) - e.g., `api.example.com`
- `path` (String) - e.g., `/v1/users/{id}`
- `source_spec` (JSON) - The original OpenAPI snippet or imported request.
- `last_scanned_at` (Timestamp)

### `findings`
Specific vulnerabilities discovered by the scanning engine.
- `id` (UUID, Primary Key)
- `asset_id` (UUID, Foreign Key)
- `detector_name` (String) - e.g., "BOLA Scanner"
- `severity` (String) - Critical, High, Medium, Low
- `status` (String) - Open, Confirmed, False Positive
- `evidence_request` (Text) - The exact HTTP request that triggered it.
- `evidence_response` (Text) - The exact HTTP response payload.
- `offset_start` (Int) - Character mapping for Monaco UI highlighting.
- `offset_end` (Int)

---

## 3. Concurrency & Performance Model

Security scanners are network I/O bound. We must use Rust's `tokio` effectively.

### 3.1 Rate Limiting (The "Polite" Scanner)
- Users must be able to configure requests per second (RPS) to avoid taking down their own staging environments.
- Implemented using Tokio's `Semaphore` or a rate-limiting crate like `governor`.

### 3.2 Streaming Results to the UI
- **Bad Approach:** Wait for a 5,000-request scan to finish, then send a massive JSON blob to the React frontend. The UI will freeze.
- **Pro Approach (WebSockets / Tauri Events):**
  1. User clicks "Scan" in React.
  2. React calls a Tauri command: `invoke("start_scan", { target_id: 123 })`.
  3. The Rust backend spawns an async Tokio task.
  4. As the Rust engine iterates, every time a finding is discovered, it emits an event: `app.emit_all("finding_discovered", finding_json)`.
  5. The React frontend listens to this event and dynamically updates the UI grid in real-time.

### 3.3 Scan Cancellation
- Sometime analysts realize they are scanning the wrong host. They need a "Cancel" button.
- Implemented in Rust via a `tokio::sync::mpsc` cancellation token passed securely to all active spawned worker threads.

---

## 4. Testing & Validation Strategy (Next Steps before coding)
Before we write the actual Rust detectors, we MUST have a vulnerable target to test them against.
- **crAPI (Completely Ridiculous API):** An OWASP project providing a deliberately vulnerable API. We will spin this up in a local Docker container and point our Workbench at it to prove our BOLA, Mass Assignment, and Data Exposure detectors actually highlight the correct JSON offsets.
