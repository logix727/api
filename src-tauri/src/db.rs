use anyhow::Result;
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use std::fs;
use std::path::PathBuf;

pub type DbPool = Pool<Sqlite>;

pub async fn init_db(app_data_dir: PathBuf) -> Result<DbPool> {
    // Ensure the data directory exists
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)?;
    }

    let db_path = app_data_dir.join("workbench.db");
    let db_url = format!("sqlite://{}?mode=rwc", db_path.to_string_lossy());

    // Create the connection pool
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    // Run initial schema creation
    create_schema(&pool).await?;

    Ok(pool)
}

async fn create_schema(pool: &DbPool) -> Result<()> {
    // Create Workspaces Table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS workspaces (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );",
    )
    .execute(pool)
    .await?;

    // Create Assets Table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS assets (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            method TEXT NOT NULL,
            endpoint TEXT NOT NULL,
            source TEXT NOT NULL,
            raw_request TEXT,
            raw_response TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_scanned DATETIME,
            FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
        );",
    )
    .execute(pool)
    .await?;

    // Create Findings Table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS findings (
            id TEXT PRIMARY KEY,
            asset_id TEXT NOT NULL,
            category TEXT NOT NULL,
            severity TEXT NOT NULL,
            description TEXT NOT NULL,
            evidence TEXT,
            status TEXT DEFAULT 'open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE
        );",
    )
    .execute(pool)
    .await?;

    // Insert a default workspace if none exists
    sqlx::query(
        "INSERT OR IGNORE INTO workspaces (id, name) VALUES ('default-workspace', 'Default Workspace');"
    )
    .execute(pool)
    .await?;

    Ok(())
}
