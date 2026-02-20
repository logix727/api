pub mod commands;
mod db;
pub mod models;
pub mod scanner;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Get the proper app path to store the db
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");

            // Start a tokio task to setup the DB
            let pool = tauri::async_runtime::block_on(async move {
                db::init_db(app_data_dir)
                    .await
                    .expect("Failed to initialize database")
            });

            // Store the pool in app state so commands can access it
            app.manage(pool);
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_assets,
            commands::add_asset,
            commands::delete_asset,
            commands::run_scan_asset,
            commands::get_findings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
