import { Play, Search, ShieldAlert } from "lucide-react";

export default function WorkbenchView() {
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
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
            <Play className="w-4 h-4" />
            Run Security Scan
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
            {/* Mock Item */}
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary/50 flex items-center gap-2 active bg-secondary/50 mt-1">
              <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">GET</span>
              <span className="text-sm truncate font-mono text-foreground">/api/v1/users</span>
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary/50 flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">POST</span>
              <span className="text-sm truncate font-mono text-muted-foreground">/api/v1/checkout</span>
            </button>
          </div>
        </div>

        {/* Center Pane - Request Builder */}
        <div className="flex-1 border-r border-border flex flex-col bg-background min-w-0">
           <div className="flex items-center gap-2 p-4 border-b border-border bg-card">
              <select className="bg-secondary border border-border rounded-md px-3 py-1.5 text-sm font-bold text-green-500 focus:outline-none">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
              </select>
              <input 
                type="text" 
                className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="https://api.example.com/v1/users/{id}"
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

           <div className="flex-1 p-4 overflow-auto">
             <div className="text-sm text-muted-foreground italic">Request Body Editor will go here</div>
           </div>
        </div>

        {/* Right Pane - Built-in Inspector & Findings */}
        <div className="w-[450px] flex flex-col bg-background shrink-0">
          <div className="h-10 border-b border-border bg-card/50 flex items-center px-4 shrink-0">
             <span className="text-sm font-semibold text-foreground">Security Inspector</span>
          </div>

          <div className="flex-1 flex flex-col">
            {/* Top Half: Raw Response */}
            <div className="flex-1 border-b border-border p-4 relative">
              <span className="absolute top-2 right-4 text-xs font-mono text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">200 OK</span>
              <div className="text-sm text-muted-foreground italic h-full">Monaco Editor for Raw Web Response mapping</div>
            </div>

            {/* Bottom Half: Intelligence Findings */}
            <div className="h-1/2 p-4 overflow-y-auto bg-card">
               <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-destructive" />
                 Active Detections (1)
               </h3>

               {/* Mock Finding */}
               <div className="border border-destructive/30 bg-destructive/5 rounded-md p-3 hover:bg-destructive/10 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded uppercase tracking-wide">Critical</span>
                    <span className="text-xs text-muted-foreground">API1: BOLA</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Excessive Data Exposure: SSN</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    The endpoint returned an unmasked Social Security Number in the JSON response body.
                  </p>
                  <button className="text-xs font-medium bg-background border border-border hover:bg-secondary px-3 py-1 rounded w-full transition-colors">
                    Triage & Mitigate
                  </button>
               </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
