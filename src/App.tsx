import { useState } from "react";
import Sidebar from "./components/Sidebar";
import WorkbenchView from "./views/Workbench";
import AssetManagerView from "./views/AssetManager";
import SettingsView from "./views/Settings";

export default function App() {
  const [activeView, setActiveView] = useState<"workbench" | "assets" | "settings">("workbench");

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeView === "workbench" && <WorkbenchView />}
        {activeView === "assets" && <AssetManagerView />}
        {activeView === "settings" && <SettingsView />}
      </main>
    </div>
  );
}
