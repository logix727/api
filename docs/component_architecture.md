# Component Architecture & Feature Specifications

This document outlines the detailed professional development plan for the four core modules of the API Security Workbench.

---

## 1. The Workbench & Inspector

**Purpose:** The active analysis environment where security professionals construct requests, execute tests, and review findings with pinpoint accuracy.

### 1.1 The Request Builder (Left/Center Pane)
- **Method & URL Bar:** Input for dynamic path variables (e.g., `/api/v1/users/{{userId}}`).
- **Authorization Tab:** Support for Basic, Bearer (JWT), API Keys, and OAuth 2.0. Must have the ability to explicitly set multiple environment variables to quickly swap contexts (e.g., `Admin_Token` vs `User_Token`) for BOLA testing.
- **Headers & Body Tabs:** Monaco-powered editors with auto-formatting for JSON and URL-encoded data.
- **Scanning Context:** A prominent "Run Security Scan" action button. Drops down to let the user select a specific `Detector Profile` (e.g., "Full OWASP" vs "Just Auth Bypasses").

### 1.2 The Inspector (Right Pane)
**Goal:** Make API inspection effortless. No digging through raw text; everything is formatted and linked.

- **Raw Transaction View (The Code View):** 
  * A Monaco editor displaying the HTTP Request and Response.
  * Must be "super pretty": Automatic JSON/XML formatting, colorized syntax highlighting, collapsible brackets, and code folding.
  * Must handle huge payloads gracefully.
- **The Instant Summary / Intelligence Panel (The Side View):**
  * When an asset is selected, this panel instantly populates with all findings for that endpoint.
  * **Organization:** Findings are rigorously grouped by OWASP Category (e.g., "API1: BOLA") and sorted by severity (Critical -> Low) with color-coded badges.
  * **Interactive Offset Mapping:** The core feature. Clicking a finding in the side summary instantly jumps the Monaco editor to the exact line/character in the code. It highlights the vulnerability (e.g., underlining the exposed SSN in red squiggles, similar to a compilation error in VS Code).
- **Triage Actions:** Each finding has a "Triage" button allowing the user to mark status or export to Teams/Jira.

---

## 2. Asset Manager

**Purpose:** The persistent database and inventory system for tracking API health over time.

### 2.1 The Living Inventory (Data Grid)
- **High-Performance Grid:** A sortable, filterable table displaying thousands of `ApiAsset` entries originating from any source.
- **Crucial Columns:** 
  * **Endpoint:** e.g., `POST /api/v1/users`
  * **Source:** Clearly denotes where this API came from (e.g., "Swagger Import", "Burp Suite XML", "Manual Paste").
  * **Detections:** A prominent, color-coded count of findings (e.g., 🔴 2 Critical, 🟡 4 Medium).
- **Click-to-Inspect:** Clicking any row in this table should instantly populate the right-side **Instant Summary Pane** without forcing the user to leave the list view.

### 2.2 Asset Details View
- Clicking an asset opens its historical view.
- **Change Log:** Shows when parameters were added or removed (Schema Drift).
- **Vulnerability Timeline:** A graph showing the time-to-remediate for findings associated with this specific endpoint.
- **Action:** A "Send to Workbench" button that immediately loads the asset into the active testing pane.

---

## 3. Import Manager

**Purpose:** A frictionless entry point for getting data from various fragmented sources into the normalized Workbench ecosystem.

### 3.1 Supported Ingestion Sources
- **Structured:** OpenAPI v2/v3 (JSON/YAML), Postman Collections (v2.1).
- **Unstructured / Semi-structured:** CSV mapping, raw cURL commands, HAR (HTTP Archive) files from Chrome DevTools, Burp Suite XML exports.
- **Direct Paste Area:** A massive, forgiving text area. If the user pastes a raw `POST /foo HTTP/1.1...` block from a terminal, the backend Rust parser intelligently converts it into an `ApiAsset`.

### 3.2 The Import Pipeline
1. **Validation & Parsing:** The Rust backend validates the file/input.
2. **Preview Mode:** Before committing to the database, the UI shows a generic tree-view of what *will* be imported (e.g., "Discovered 45 endpoints across 2 hosts").
3. **Conflict Resolution:** If an endpoint already exists in the Asset Manager, the UI prompts the user to `Merge`, `Overwrite`, or `Skip`.
4. **Environment Tagging:** Prompts the user to tag the incoming batch (e.g., `Prod`, `Staging`, `v1.2 Release`).

---

## 4. Settings & Integrations

**Purpose:** Configuration for the scanning engine and hooks into the enterprise ecosystem.

### 4.1 Global Configurations
- **Environment Variables Vault:** Secure, encrypted local storage (using OS keychain if possible, e.g., via Tauri) for API keys, secret tokens, and base URLs used in the Workbench.
- **Scanner Configuration:**
  * Toggle specific rules on/off globally (e.g., "Disable HSTS checks on localhost").
  * Define custom regex patterns for the Sensitive Data Exposure detector (e.g., custom internal employee ID formats).

### 4.2 Integrations (The Triage Pipeline)
- **Microsoft Teams:**
  * Input for Webhook URLs.
  * Adaptive Card template designer (define what the notification looks like when a critical issue is found).
- **Outlook/Exchange:**
  * SMTP configuration or Graph API OAuth connection.
  * Automated Report definitions (e.g., "Automatically email the Lead Dev a PDF summary every Friday at 5 PM if there are unresolved Critical findings").
- **Export Formats:** Configuration for how manual exports look (CSV, JSON, PDF reports with customizable company logos).
