# Application Self-Protection & Delivery Pipeline

Because the API Security Workbench ingests Highly Confidential code, raw HTTP responses (containing PII), and API Keys for active scanning, the application *itself* must be an impenetrable fortress on the analyst's machine.

## 1. Local Data Encryption (At-Rest)

If the analyst's laptop is stolen, the SQLite database containing the API mappings and scan results must be useless to an attacker.

- **SQLite Encryption:** We will use `sqlcipher` instead of standard SQLite in the Rust backend. 
- **The Key:** 
  * The DB is encrypted with an AES-256 key.
  * This key is never stored in plain text. It is securely stored in the operating system's native secure enclave using the Rust `keyring` crate:
    - **Windows:** Windows Credential Manager.
    - **macOS:** Apple Keychain.
    - **Linux:** Secret Service API / D-Bus.
- **Workflow:** When the app launches, Rust silently requests the master key from the OS Keychain, unlocks the SQLite DB in memory, and the app functions seamlessly. The user does nothing.

## 2. Secure Credential Handling (In-Memory)

When a user provides a Bearer Token or AWS Key to actively scan an environment:
- **Never Store:** We do not store active authentication tokens in `sqlcipher`. They are ephemeral.
- **Environment Variables:** The user inputs them into a strictly memory-only "Vault" array in the React state.
- **Zero-Logging Policy:** The Rust scanning engine must be strictly audited to ensure `reqwest` errors or panic logs *never* write full HTTP headers to a local text file. All custom debug logging will sanitize `Authorization: Bearer <scrubbed>`.

## 3. Automated CI/CD Pipeline (GitHub Actions)

To distribute this professional tool, we need a bulletproof build pipeline. Tauri makes this complex but powerful.

### The `.github/workflows/release.yml`

This pipeline triggers when a Git Tag (e.g., `v1.0.0`) is pushed.

1. **Matrix Build:** Spins up `ubuntu-latest`, `windows-latest`, and `macos-latest` simultaneously.
2. **Setup:** Installs Rust `stable`, Node.js `20.x`, and OS-specific dependencies (e.g., `libwebkit2gtk-4.0-dev` for Linux).
3. **Lint & Test:**
   - Frontend: `npm run lint` & `npm run test` (Vitest).
   - Backend: `cargo clippy -- -D warnings` & `cargo test`.
4. **Compile & Package (Tauri Build):**
   - **Windows:** Outputs an `.msi` installer and an `.exe`.
   - **macOS:** Outputs a `.dmg` and an `.app` (M1/ARM64 and Intel builds).
   - **Linux:** Outputs an `AppImage` and a `.deb`.
5. **Code Signing:**
   - Essential for enterprise distribution so Windows Defender/MacOS Gatekeeper don't block the app.
   - Inject Apple Developer ID certificates and Windows Authenticode signatures securely via GitHub Secrets.
6. **Publish:** Automatically creates a GitHub Release and attaches all binaries.
