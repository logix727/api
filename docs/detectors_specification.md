# API Security Workbench: Detector Specifications (Rust)

## Overview
This document outlines the core detection engines for the API Security Workbench. All engines are designed to be implemented in Rust for high performance, utilizing asynchronous network requests and memory-efficient parallel processing. The focus is on finding actionable API vulnerabilities and providing precise file/response offsets to the UI for triage.

## Core Architecture

### The `Detector` Trait
Every security scanner will implement a unified `Detector` trait. This allows the core scanning engine to iterate over an active request or a batch of ingested assets and run them dynamically.

```rust
use async_trait::async_trait;
use reqwest::{Request, Response};

#[async_trait]
pub trait Detector {
    /// Name of the detector (e.g., "BOLA Scanner", "JWT Tampering")
    fn name(&self) -> &'static str;
    
    /// The OWASP API Top 10 category
    fn category(&self) -> OwaspCategory;
    
    /// Run the detector against a static asset (passive scan)
    fn run_passive(&self, asset: &ApiAsset) -> Result<Vec<Finding>, ScanError>;
    
    /// Run the detector using active network requests (active scan)
    async fn run_active(&self, context: &mut ScanContext) -> Result<Vec<Finding>, ScanError>;
}
```

### The `Finding` Data Model
Crucial for the Workbench UI, every finding must pinpoint where the issue is.

```rust
pub struct Finding {
    pub id: uuid::Uuid,
    pub title: String,
    pub description: String,
    pub severity: Severity,
    pub category: OwaspCategory,
    pub endpoint_id: uuid::Uuid,
    pub location: FindingLocation,
    pub remediation_snippet: String,
}

pub struct FindingLocation {
    pub target: TargetArea, // e.g., Body, Header, URL Parameter
    pub start_offset: usize, // Character index start
    pub end_offset: usize,   // Character index end
    pub matching_content: String,
}
```

---

## 1. BOLA / IDOR (Broken Object Level Authorization)
**Category:** API1:2023
**Type:** Active Scan

### Detection Logic
1. **Identify Identifiers:** Use regex and heuristics to find IDs in the URL path (e.g., `/api/users/123`), query params (`?user_id=123`), or JSON body.
2. **Session Contexts:** Require the user to configure at least two authenticated session contexts (Context A and Context B).
3. **Execution:**
   - Send request for Object A using Context A. (Expected: `200 OK`)
   - Send request for Object A using Context B. 
4. **Validation:** If Context B receives a `200 OK` and the response body matches the data from Context A's response, a **Critical BOLA Finding** is generated.

---

## 2. Broken Authentication (JWT Tampering & Analysis)
**Category:** API2:2023
**Type:** Passive & Active Scan

### 2.1 Passive Detection (Local parsing)
- **Algorithm Analysis:** Check if `alg` is `none`, `HS256` (when RS256 is expected), or missing.
- **Payload Inspection:** Decode base64 payload. Scan for PII (emails, SSNs) or sensitive claims (`is_admin: true`) stored without encryption.
- **Expiration Checks:** Check if `exp` claim is missing or set impractically far in the future.

### 2.2 Active Tampering
- **Signature Stripping:** Remove the signature portion of the JWT and resend. If the server accepts it (`200 OK`), flag as Critical.
- **Algorithm Confusion:** Change RS256 to HS256, signing the token with the public key as the HMAC secret. Resend.

---

## 3. Broken Object Property Level Authorization (Mass Assignment & Excessive Data)
**Category:** API3:2023
**Type:** Passive & Active Scan

### 3.1 Excessive Data Exposure (Passive)
- Read the final response body received from the server.
- Run high-performance Regex/Aho-Corasick in Rust against the JSON string to detect:
  - Credit Card Numbers, SSNs, API Keys, Passwords, Hashes.
- Map the byte offset of the regex match in the raw JSON string to populate `FindingLocation`.

### 3.2 Mass Assignment (Active)
- Given a `PUT` or `POST` request (e.g., updating a profile), the engine fuzzes the JSON body by injecting administrative flags.
- **Payload Generation:**
  - `{"original_field": "value", "is_admin": true}`
  - `{"original_field": "value", "role": "admin"}`
- **Validation:** If the API returns `200 OK` and a subsequent `GET` reveals the property was successfully mutated, flag as **High**.

---

## 4. Security Misconfiguration & HTTP Header Scanning
**Category:** API8:2023
**Type:** Passive Scan

### Detection Logic
- Inspect the raw HTTP response headers.
- **Checks against missing/weak headers:**
  - Missing `Strict-Transport-Security` (HSTS).
  - Weak CORS configurations (`Access-Control-Allow-Origin: *` mixed with credentials).
  - Exposure of server details (`X-Powered-By: Express`, `Server: Apache`).
- **Offset Mapping:** Record the exact character offset of the offending header block to allow the UI to highlight the header directly in the Response tab.

---

## 5. Improper Inventory Management (Shadow APIs & Schema Drift)
**Category:** API9:2023
**Type:** Passive Scan

### Detection Logic
- Requires an ingested baseline (e.g., an OpenAPI v3 specification file).
- The `ShadowApiDetector` compares observed traffic (request/response shapes) against the specification.
- **Drift Identification:**
  - *Undocumented Endpoints:* An API call is made to a route not in the spec.
  - *Undocumented Parameters:* A request includes a query parameter or body field not defined in the spec.
  - *Response Drift:* The server returns fields in the JSON response that are missing from the schema definition.
- **Offset Mapping:** Highlights the specific undocumented JSON key in the Workbench UI's response viewer.

---

## 6. Business Logic & Workflow Abuse (Traceable/Noname Standard)
**Category:** Advanced Logic Flaws / API6:2023 (Unrestricted Access to Sensitive Business Flows)
**Type:** Active Scan

### 6.1 Multi-Step State Bypasses
- **Detection Logic:** Automatically identifies sequential API flows (e.g., `POST /cart` -> `POST /checkout` -> `POST /confirm`).
- The scanner actively tries to call step 3 (`/confirm`) without completing step 2 (`/checkout`), or calls them out of order.
- **Validation:** If the API successfully processes the out-of-order request, flag as **Critical**.

### 6.2 B2B API Consumption (API10:2023)
- **Detection Logic:** Identifies APIs that take URLs or partner data as input (e.g., webhook configurations).
- Injects blind SSRF payloads or malformed JSON aimed at partner systems.

---

## 7. Parameter Pollution & API Gateway Bypasses
**Category:** Advanced Injection / Evasion Mechanisms
**Type:** Active Scan

### 7.1 HTTP Parameter Pollution (HPP)
- **Detection Logic:** Injects identical parameters into a request to see which one the backend server honors versus what the Gateway honors.
  - Example: `GET /api/account?id=123&id=456`
- **Validation:** Analyzes the response to determine if parameter precedence can be used to bypass WAF or authorization checks.

### 7.2 Routing Logic Evasion
- **Detection Logic:** Uses double URL encoding, path traversal characters (`/api/v1/../v2/admin`), and HTTP Method Overrides (`X-HTTP-Method-Override: PUT`) to trick API Gateway routing rules.

---

## 8. Behavioral Anomalies & ATO (Account Takeover) Simulation
**Category:** Salt Security / Traceable AI Standard
**Type:** Stateful / Active Testing

### 8.1 Credential Stuffing & Rate Limit Evasion (API4:2023)
- **Detection Logic:** Simulates a low-and-slow authentication attack against endpoints identified as login paths (`/api/auth/login`).
- Intentionally spaces out requests or rotates injected `X-Forwarded-For` headers to verify if the API's rate limiting is IP-based or Account-based.
- **Validation:** If the engine can execute 50+ failed logins on a single account bypassing IP blocks, flag as **High**.
