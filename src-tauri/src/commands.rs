use crate::db::DbPool;
use crate::models::{Asset, Finding};
use crate::scanner::run_scan_on_asset;
use chrono::Utc;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub async fn get_assets(
    workspace_id: String,
    state: State<'_, DbPool>,
) -> Result<Vec<Asset>, String> {
    let pool = state.inner();
    let assets = sqlx::query_as::<_, Asset>(
        "SELECT id, workspace_id, method, endpoint, source, raw_request, raw_response, created_at, last_scanned FROM assets WHERE workspace_id = ?"
    )
    .bind(workspace_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(assets)
}

#[tauri::command]
pub async fn add_asset(
    workspace_id: String,
    method: String,
    endpoint: String,
    source: String,
    raw_request: Option<String>,
    raw_response: Option<String>,
    state: State<'_, DbPool>,
) -> Result<Asset, String> {
    let pool = state.inner();
    let id = Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO assets (id, workspace_id, method, endpoint, source, raw_request, raw_response) 
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&workspace_id)
    .bind(&method)
    .bind(&endpoint)
    .bind(&source)
    .bind(&raw_request)
    .bind(&raw_response)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    // Fetch the newly created asset
    let asset = sqlx::query_as::<_, Asset>(
        "SELECT id, workspace_id, method, endpoint, source, raw_request, raw_response, created_at, last_scanned FROM assets WHERE id = ?"
    )
    .bind(&id)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(asset)
}

#[tauri::command]
pub async fn delete_asset(id: String, state: State<'_, DbPool>) -> Result<(), String> {
    let pool = state.inner();

    sqlx::query("DELETE FROM assets WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn run_scan_asset(
    asset_id: String,
    state: State<'_, DbPool>,
) -> Result<Vec<Finding>, String> {
    let pool = state.inner();

    // 1. Fetch the asset
    let asset = sqlx::query_as::<_, Asset>(
        "SELECT id, workspace_id, method, endpoint, source, raw_request, raw_response, created_at, last_scanned FROM assets WHERE id = ?"
    )
    .bind(&asset_id)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    // 2. Execute the scanning networking module
    let findings = run_scan_on_asset(&asset).await?;

    // 3. Save findings to DB
    for finding in &findings {
        sqlx::query(
            "INSERT INTO findings (id, asset_id, category, severity, description, evidence, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&finding.id)
        .bind(&finding.asset_id)
        .bind(&finding.category)
        .bind(&finding.severity)
        .bind(&finding.description)
        .bind(&finding.evidence)
        .bind(&finding.status)
        .bind(&finding.created_at)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    }

    // 4. Update Asset's last_scanned
    let now = Utc::now().to_rfc3339();
    sqlx::query("UPDATE assets SET last_scanned = ? WHERE id = ?")
        .bind(now)
        .bind(&asset_id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(findings)
}

#[tauri::command]
pub async fn get_findings(
    asset_id: String,
    state: State<'_, DbPool>,
) -> Result<Vec<Finding>, String> {
    let pool = state.inner();

    let findings = sqlx::query_as::<_, Finding>(
        "SELECT id, asset_id, category, severity, description, evidence, status, created_at FROM findings WHERE asset_id = ?"
    )
    .bind(asset_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(findings)
}
