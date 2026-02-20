use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct Asset {
    pub id: String,
    pub workspace_id: String,
    pub method: String,
    pub endpoint: String,
    pub source: String,
    pub raw_request: Option<String>,
    pub raw_response: Option<String>,
    pub created_at: String,
    pub last_scanned: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct Finding {
    pub id: String,
    pub asset_id: String,
    pub category: String,
    pub severity: String,
    pub description: String,
    pub evidence: Option<String>,
    pub status: String,
    pub created_at: String,
}
