use crate::db::DbPool;
use crate::models::Asset;
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
