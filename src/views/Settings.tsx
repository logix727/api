import { Shield, Key, Webhook } from "lucide-react";

export default function SettingsView() {
  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden p-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global application behaviors and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Core Settings Block */}
        <div className="border border-border rounded-lg bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Scanner Configuration</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Max Requests per Second</span>
              <input type="number" defaultValue={50} className="bg-background border border-border rounded-md px-3 py-1 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-primary" />
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background" />
              <span className="text-sm">Enable Advanced Logic Checks</span>
            </label>
          </div>
        </div>

        {/* Vault Block */}
        <div className="border border-border rounded-lg bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Secrets Vault</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Secure environment variables encrypted via OS Keychain for use during active scanning.</p>
          <button className="bg-secondary text-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium text-sm transition-colors w-full">
            Manage Secrets
          </button>
        </div>

        {/* Integrations Block */}
        <div className="border border-border rounded-lg bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Webhook className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Integrations</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between border border-border bg-background hover:bg-secondary px-4 py-3 rounded-md transition-colors group">
              <span className="text-sm font-medium">Microsoft Teams</span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground">Configured</span>
            </button>
            <button className="w-full flex items-center justify-between border border-border bg-background hover:bg-secondary px-4 py-3 rounded-md transition-colors group">
              <span className="text-sm font-medium">Outlook Reporting</span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground">Not Setup</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
