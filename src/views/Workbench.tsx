import { Play, Search, ShieldAlert } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useAssetStore, Asset } from "../store/assetStore";
import { useEffect, useState } from "react";

export default function WorkbenchView() {
  const { assets, fetchAssets, isLoading, fetchFindings, runScan, findings } = useAssetStore();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    fetchAssets("default-workspace");
  }, [fetchAssets]);

  // When selectedAsset changes, fetch its findings
  useEffect(() => {
    if (selectedAsset) {
      fetchFindings(selectedAsset.id);
    }
  }, [selectedAsset, fetchFindings]);

  const handleRunScan = async () => {
    if (selectedAsset) {
      await runScan(selectedAsset.id);
    }
  };

  const mockRequestBody = `{\n  "userId": "12345",\n  "include_private": true\n}`;
  const mockRawResponse = `HTTP/1.1 200 OK\nContent-Type: application/json\nX-Powered-By: Express\n\n{\n  "status": "success",\n  "data": {\n    "id": 12345,\n    "name": "Jane Doe",\n    "ssn": "000-00-0000",\n    "role": "user"\n  }\n}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      
      {/* Header Bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-lg">Active Session</h2>
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
            Demo API v1
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunScan}
            disabled={!selectedAsset || isLoading}
            className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              !selectedAsset || isLoading ? 'bg-secondary text-muted-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
          >
            <Play className="w-4 h-4" />
            {isLoading ? "Scanning..." : "Run Security Scan"}
          </button>
        </div>
      </header>

      {/* Three Pane Layout */}
      <div className="flex-1 flex min-h-0">
        
        {/* Left Pane - Asset Selection / History */}
        <div className="w-64 border-r border-border bg-card/50 flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search endpoints..." 
                className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
              Staged API Assets
            </div>
            {isLoading ? (
              <div className="text-sm text-muted-foreground px-2 py-4">Loading assets...</div>
            ) : assets.length === 0 ? (
              <div className="text-sm text-muted-foreground px-2 py-4">No assets staged. Use the Asset Manager to import.</div>
            ) : (
              assets.map(asset => (
                <button 
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 mt-1 transition-colors ${
                    selectedAsset?.id === asset.id ? 'bg-secondary active' : 'hover:bg-secondary/50'
                  }`}
                >
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    asset.method === 'GET' ? 'text-green-500 bg-green-500/10' :
                    asset.method === 'POST' ? 'text-blue-500 bg-blue-500/10' :
                    asset.method === 'DELETE' ? 'text-red-500 bg-red-500/10' :
                    'text-yellow-500 bg-yellow-500/10'
                  }`}>
                    {asset.method}
                  </span>
                  <span className={`text-sm truncate font-mono ${selectedAsset?.id === asset.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {asset.endpoint}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center Pane - Request Builder */}
        <div className="flex-1 border-r border-border flex flex-col bg-background min-w-0">
           <div className="flex items-center gap-2 p-4 border-b border-border bg-card">
              <select 
                value={selectedAsset?.method || "GET"}
                className="bg-secondary border border-border rounded-md px-3 py-1.5 text-sm font-bold text-green-500 focus:outline-none focus:ring-1 focus:ring-primary"
                onChange={() => {}}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
                <option value="ANY">ANY</option>
              </select>
              <input 
                type="text" 
                className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                value={selectedAsset?.endpoint || "https://api.example.com/v1/..."}
                onChange={() => {}}
              />
              <button className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
                Send
              </button>
           </div>
           
           <div className="flex border-b border-border bg-card/50 px-4">
             {['Params', 'Headers', 'Auth', 'Body'].map(tab => (
               <button key={tab} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === 'Headers' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                 {tab}
               </button>
             ))}
           </div>

           <div className="flex-1 overflow-hidden">
             <Editor 
                height="100%" 
                defaultLanguage="json" 
                theme="vs-dark" 
                value={selectedAsset?.raw_request || mockRequestBody}
                options={{ minimap: { enabled: false }, roundedSelection: true, padding: { top: 16 } }}
             />
           </div>
        </div>

        {/* Right Pane - Built-in Inspector & Findings */}
        <div className="w-[450px] flex flex-col bg-background shrink-0">
          <div className="h-10 border-b border-border bg-card/50 flex items-center px-4 shrink-0">
             <span className="text-sm font-semibold text-foreground">Security Inspector</span>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Half: Raw Response */}
            <div className="flex-1 border-b border-border relative flex flex-col min-h-0 bg-zinc-950">
              <div className="absolute top-2 right-4 z-10 flex gap-2">
                 <span className="text-xs font-mono text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">200 OK</span>
              </div>
              <Editor 
                height="100%" 
                defaultLanguage="json" 
                theme="vs-dark" 
                value={selectedAsset ? (selectedAsset.raw_response || "No response recorded.") : mockRawResponse}
                options={{ 
                  minimap: { enabled: false }, 
                  readOnly: true,
                  wordWrap: "on",
                  padding: { top: 40 },
                  scrollBeyondLastLine: false
                }}
              />
            </div>

            {/* Bottom Half: Intelligence Findings */}
            <div className="h-1/2 p-4 overflow-y-auto bg-card">
               <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-destructive" />
                 Active Detections ({selectedAsset ? (findings[selectedAsset.id]?.length || 0) : 0})
               </h3>

               {selectedAsset && findings[selectedAsset.id]?.length > 0 ? (
                 findings[selectedAsset.id].map(finding => (
                   <div key={finding.id} className="border border-destructive/30 bg-destructive/5 rounded-md p-3 hover:bg-destructive/10 cursor-pointer transition-colors mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                          finding.severity === 'High' ? 'text-destructive bg-destructive/10' :
                          finding.severity === 'Medium' ? 'text-orange-500 bg-orange-500/10' :
                          'text-yellow-500 bg-yellow-500/10'
                        }`}>
                          {finding.severity}
                        </span>
                        <span className="text-xs text-muted-foreground">{finding.category}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">{finding.description}</h4>
                      {finding.evidence && (
                        <p className="text-xs text-muted-foreground mb-3 font-mono bg-background p-1.5 rounded border border-border mt-2 overflow-x-auto whitespace-pre">
                          {finding.evidence.substring(0, 100)}...
                        </p>
                      )}
                      <button className="text-xs font-medium bg-background border border-border hover:bg-secondary px-3 py-1 rounded w-full transition-colors mt-2">
                        Triage & Mitigate
                      </button>
                   </div>
                 ))
               ) : (
                 <div className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-md bg-background/50">
                    No active detections.
                 </div>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
