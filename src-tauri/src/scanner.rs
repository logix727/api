use crate::models::{Asset, Finding};
use reqwest::Client;
use std::time::Duration;
use uuid::Uuid;

pub async fn run_scan_on_asset(asset: &Asset) -> Result<Vec<Finding>, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(10))
        .danger_accept_invalid_certs(true) // For testing environments
        .build()
        .map_err(|e| e.to_string())?;

    let mut findings = Vec::new();

    // In a full implementation, we would execute complex BOLA, Mass Assignment, etc. here.
    // For now, we perform a basic scan to prove the engine architecture works.

    // Test 1: Identify if endpoint is accessible and unauthenticated
    let builder = match asset.method.as_str() {
        "GET" => client.get(&asset.endpoint),
        "POST" => client.post(&asset.endpoint),
        "PUT" => client.put(&asset.endpoint),
        "DELETE" => client.delete(&asset.endpoint),
        "PATCH" => client.patch(&asset.endpoint),
        _ => client.get(&asset.endpoint),
    };

    let response = builder.send().await;

    match response {
        Ok(res) => {
            let status = res.status();
            let body = res.text().await.unwrap_or_default();

            // Mock BOLA / Excessive Data Exposure Check
            if body.contains("ssn") || body.contains("social_security") || body.contains("password")
            {
                findings.push(Finding {
                    id: Uuid::new_v4().to_string(),
                    asset_id: asset.id.clone(),
                    category: "Sensitive Data Exposure".to_string(),
                    severity: "High".to_string(),
                    description: "Potential PII or sensitive fields detected in raw response body."
                        .to_string(),
                    evidence: Some(body.chars().take(200).collect()),
                    status: "open".to_string(),
                    created_at: chrono::Utc::now().to_rfc3339(),
                });
            }

            // Mock Security Misconfiguration Check
            if status.is_server_error() {
                findings.push(Finding {
                    id: Uuid::new_v4().to_string(),
                    asset_id: asset.id.clone(),
                    category: "Security Misconfiguration".to_string(),
                    severity: "Medium".to_string(),
                    description:
                        "Endpoint returned a 500-level error, potentially leaking stack traces."
                            .to_string(),
                    evidence: Some(format!("Status: {}", status)),
                    status: "open".to_string(),
                    created_at: chrono::Utc::now().to_rfc3339(),
                });
            }
        }
        Err(e) => {
            // Log networking errors but don't necessarily fail the whole scan module
            println!("Scan network error for {}: {}", asset.endpoint, e);
        }
    }

    Ok(findings)
}
