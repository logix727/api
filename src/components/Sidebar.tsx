import { Activity, Database, Settings, ShieldAlert, Cpu } from "lucide-react";

interface SidebarProps {
  activeView: "workbench" | "assets" | "settings";
  setActiveView: (view: "workbench" | "assets" | "settings") => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const getBtnClass = (id: string) => {
    const base = "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors";
    return activeView === id 
      ? `${base} bg-secondary text-primary font-medium border-r-2 border-primary`
      : `${base} text-muted-foreground hover:bg-secondary/50 hover:text-foreground`;
  };

  return (
    <div className="w-64 flex flex-col bg-card border-r border-border h-full shrink-0">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <ShieldAlert className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight text-foreground">API Security</h1>
          <h2 className="text-xs text-muted-foreground font-medium">Workbench</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-1">
        <button 
          onClick={() => setActiveView("workbench")}
          className={getBtnClass("workbench")}
        >
          <Activity className="w-4 h-4" />
          Workbench
        </button>

        <button 
          onClick={() => setActiveView("assets")}
          className={getBtnClass("assets")}
        >
          <Database className="w-4 h-4" />
          Asset Manager
        </button>

      </nav>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-border flex flex-col gap-1">
        <button 
          onClick={() => setActiveView("settings")}
          className={getBtnClass("settings")}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

    </div>
  );
}
