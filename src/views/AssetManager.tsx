import { Database, Download, Filter, Search } from "lucide-react";
import { useState } from "react";
import ImportModal from "../components/ImportModal";

export default function AssetManagerView() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden p-8">
      
      {/* Import Modal Overlay */}
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Manager</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all discovered API endpoints across your workspaces.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-secondary text-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Database className="w-4 h-4" />
            Import Assets
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-card p-4 rounded-t-lg border border-border border-b-0">
        <div className="relative w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search endpoints, hosts, or tags..." 
            className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <button className="bg-secondary text-foreground hover:bg-secondary/80 px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Data Grid Mockup */}
      <div className="flex-1 border border-border rounded-b-lg overflow-auto bg-card">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-secondary/50 text-muted-foreground border-b border-border sticky top-0">
            <tr>
              <th className="px-6 py-3 font-medium">Endpoint</th>
              <th className="px-6 py-3 font-medium">Source</th>
              <th className="px-6 py-3 font-medium">Last Scanned</th>
              <th className="px-6 py-3 font-medium text-right">Detections</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground cursor-pointer">
            <tr className="hover:bg-secondary/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">GET</span>
                  <span className="font-mono">/api/v1/users</span>
                </div>
              </td>
              <td className="px-6 py-4 text-muted-foreground">Swagger Import</td>
              <td className="px-6 py-4 text-muted-foreground">2 hours ago</td>
              <td className="px-6 py-4 text-right">
                <span className="inline-flex items-center gap-1 bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded">
                  <span className="w-2 h-2 rounded-full bg-destructive"></span>
                  2 Critical
                </span>
              </td>
            </tr>
            <tr className="hover:bg-secondary/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">POST</span>
                  <span className="font-mono">/api/v1/checkout</span>
                </div>
              </td>
              <td className="px-6 py-4 text-muted-foreground">Burp Suite XML</td>
              <td className="px-6 py-4 text-muted-foreground">1 day ago</td>
              <td className="px-6 py-4 text-right">
                <span className="text-muted-foreground">Clean</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
