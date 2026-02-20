# Code Structure & Development Plan

To ensure the API Security Workbench remains maintainable as it scales, we will enforce a strict separation of concerns between the React frontend and the Rust backend, utilizing domain-driven design principles.

## 1. Directory Layout

The project will be scaffolded using `create-tauri-app` with the React/TypeScript template.

```text
/c/dev/api
├── /docs/                       # All architectural & planning documents
├── /src/                        # Frontend (React + TypeScript)
│   ├── /components/             # Reusable UI elements (Button, Grid, MonacoEditor)
│   ├── /hooks/                  # Custom React hooks (e.g., useTauri, useScan)
│   ├── /store/                  # Global state management (Zustand)
│   ├── /types/                  # TypeScript Data Transfer Objects (DTOs)
│   ├── /views/                  # Main route pages (Workbench, Assets, Settings)
│   ├── App.tsx                  # Main React Entrypoint
│   └── index.css                # Global Tailwind CSS & Tailwind imports
├── /src-tauri/                  # Backend (Rust)
│   ├── /src/
│   │   ├── /commands/           # Tauri IPC Handlers (callable from React)
│   │   ├── /db/                 # SQLite integration, migrations, and models
│   │   ├── /models/             # Rust structs mapped to the frontend DTOs
│   │   ├── /scanner/            # The Tokio-based asynchronous scanning engine
│   │   │   ├── /detectors/      # Implementations of specific OWASP scanners
│   │   │   └── engine.rs        # Core orchestration and rate-limiting logic
│   │   ├── /utils/              # Secure keyring management and helpers
│   │   ├── main.rs              # Tauri configuration and app bootstrap
│   │   └── lib.rs               # Library root export
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Overall Tauri app configuration
├── package.json                 # Node dependencies
├── tailwind.config.js           # Tailwind UI theming
└── tsconfig.json                # TypeScript strict configuration
```

## 2. Setting Up the Development Environment

### 2.1 Dependencies Required
- **Node.js**: v20+ (for Vite and React).
- **Rust**: Latest stable toolchain (via `rustup`).
- **OS Tooling**: Desktop-specific C++ build tools (Visual Studio Build Tools for Windows).

### 2.2 Scaffolding Commands
The foundational setup will be triggered using:
```bash
npx create-tauri-app@latest . --manager npm --template react-ts
npm install
```

We will then install the core UI libraries:
```bash
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react   # For professional iconography
npm install zustand        # For lightweight state management
npm install @monaco-editor/react # The core text editor for the workbench
```

### 2.3 Rust Back-End Dependencies
Updating `Cargo.toml` with the necessary enterprise crates:
```toml
# Async runtime & requests
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.11", features = ["json"] }

# SQLite Database
sqlx = { version = "0.7", features = ["runtime-tokio-native-tls", "sqlite", "uuid"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Identifiers
uuid = { version = "1.7", features = ["v4", "serde"] }

# Security / OS Integrations
keyring = "2"
```

## 3. Development Workflow

1. **Terminal 1 (Frontend):** Run `npm run tauri dev`. This spins up Vite's HMR (Hot Module Replacement) and compiles the Rust binary.
2. **Terminal 2 (Database):** Create migrations using `sqlx-cli` whenever the data model changes.
3. Every time a new IPC command is added to Rust, its type signature MUST be mirrored exactly in `src/types/`.
