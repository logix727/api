# API Security Workbench 🛡️

A high-performance, desktop-class API security testing and inventory tool built for modern AppSec teams.

Unlike traditional DAST scanners or clunky browser dev tools, the API Security Workbench is purpose-built to merge inventory management with intelligent vulnerability detection (BOLA, Broken Auth, Mass Assignment, and Behavioral Anomalies) in a single, lightning-fast interface.

## 🚀 Key Features

* **Instant Intelligence:** Ditch raw text parsing. The Workbench features a dual-pane setup powered by the Monaco Editor. Click a finding, and the exact character offset of the vulnerability is highlighted natively in the code editor.
* **Rust-Powered Engine:** Built on Tauri, the backend scanning engine can execute thousands of targeted fuzzy-payloads per second without ever freezing the React UI thread.
* **Advanced Detecors:** Goes beyond the standard OWASP Top 10 to implement detectors for Route Evasion, HTTP Parameter Pollution, and Multi-Step State Bypasses.
* **Frictionless Ingestion:** Drag and drop OpenAPI specs, Postman collections, raw Burp Suite XMLs, or just paste a raw `cURL` command to instantly build an executable `ApiAsset`.
* **Enterprise Secure:** Designed for the desktop. Your sensitive API payloads, keys, and customer data never leave your machine. SQLite databases are encrypted at rest using OS-native Keychains.

## 🏗️ Architecture Stack

* **Frontend:** React 18, TypeScript, Tailwind CSS, Zustand, Monaco Editor.
* **Backend:** Rust, Tauri, Tokio (Async Networking), SQLx (SQLite).
* **Communication:** Asynchronous Tauri IPC Events.

## 📖 Documentation

The complete architectural system design, data models, and detector specifications can be found in the `/docs` folder:
- [Component Architecture](./docs/component_architecture.md)
- [System Architecture](./docs/system_architecture.md)
- [Detector Specifications](./docs/detectors_specification.md)
- [Application Security & DevSecOps](./docs/app_security_and_pipeline.md)

## 🛠️ Local Development

### Prerequisites
- Node.js (v20+)
- Rust (Latest Stable)
- Desktop Build Tools (Visual Studio C++ for Windows)

### Quick Start
```bash
# Install UI dependencies
npm install

# Start the Tauri desktop dev server (compiles Rust and launches Vite)
npm run tauri dev
```
