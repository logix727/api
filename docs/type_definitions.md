# The Contract: Rust/TypeScript Data Transfer Objects (DTOs)

To ensure the UI is "dumb, intuitive, and seamless," the Frontend must never guess what data it is receiving. The Rust backend will strictly serialize data into these formats, and React will strictly type-check them.

## 1. The Core `ApiAsset` DTO

This is the object that represents a single endpoint in the Asset Manager grid.

```typescript
// Shared Types (Frontend) / Serde Structs (Backend)

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";
export type AssetSource = "SWAGGER_IMPORT" | "BURP_XML" | "MANUAL_PASTE" | "CHROME_HAR";

export interface ApiAssetDTO {
  id: string; // UUID
  workspaceId: string; // UUID
  method: HttpMethod;
  host: string; // e.g., "api.production.com"
  path: string; // e.g., "/v2/users/{id}/settings"
  source: AssetSource;
  
  // The 'Dumb UI' fields - Precomputed by Rust so React just displays them
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  
  lastScannedAt: string | null; // ISO 8601 DateTime
}
```

## 2. The `FindingSummary` DTO

When the user clicks an `ApiAsset` in the grid, this is the payload sent to the Right Pane (Inspector). It must contain exactly enough info to render the beautiful Monaco editor response and the red squiggly lines.

```typescript
export type OwaspCategory = 
  | "API1_2023_BOLA" 
  | "API2_2023_BROKEN_AUTH" 
  | "API3_2023_BOPLA" // Mass Assignment / Excessive Data
  | "API6_2023_BUSINESS_LOGIC" 
  | "API9_2023_IMPROPER_INVENTORY";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type TriageStatus = "OPEN" | "CONFIRMED" | "FALSE_POSITIVE" | "RISK_ACCEPTED";

export interface MonacoHighlightOffset {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface FindingDTO {
  id: string;
  assetId: string;
  title: string; // e.g., "Excessive Data Exposure: SSN Leaked"
  description: string;
  severity: Severity;
  category: OwaspCategory;
  status: TriageStatus;
  
  // The Evidence
  rawRequestTriggers: string; // The HTTP request Rust sent to find this
  rawResponseEvidence: string; // The exact HTTP response received
  
  // The Magic - Tells the Monaco Editor exactly where to put the red underline
  uiHighlightMapping: MonacoHighlightOffset | null;
}
```

## 3. The `ScanEvent` DTO

For the buttery-smooth "Instant Summary," the UI needs to update while the scan is running without freezing. This is the WebSockets/Tauri Event payload emitted by the Rust engine.

```typescript
export interface ScanProgressEvent {
  scanJobId: string;
  totalEndpoints: number;
  endpointsCompleted: number;
  currentStatus: "RUNNING" | "RATE_LIMITED" | "FINISHED" | "CANCELLED";
  
  // If a finding is discovered during THIS tick, include it so the UI instantly pops it in
  newFindingDiscovered?: FindingDTO; 
}
```
