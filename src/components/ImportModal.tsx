import { Upload, FileJson, Copy, X } from "lucide-react";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { downloadDir } from "@tauri-apps/api/path";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [importMode, setImportMode] = useState<"file" | "paste">("file");
  const [pasteContent, setPasteContent] = useState("");

  const handleFileBrowse = async () => {
    try {
      const defaultPath = await downloadDir();
      const selected = await open({
        defaultPath,
        multiple: false,
        filters: [{
          name: 'API Specifications',
          extensions: ['json', 'yaml', 'yml', 'xml', 'har', 'csv', 'txt']
        }]
      });

      if (selected && typeof selected === 'string') {
        const contents = await readTextFile(selected);
        setPasteContent(contents);
        setImportMode("paste");
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-3xl border border-border rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Import API Assets</h2>
            <p className="text-sm text-muted-foreground mt-1">Ingest OpenAPI specs, Postman collections, or raw HTTP traffic.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-md text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setImportMode("file")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-3 border transition-colors ${
                importMode === "file" 
                ? "bg-primary/10 border-primary text-primary font-medium" 
                : "bg-background border-border text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <FileJson className="w-5 h-5" />
              File Upload
            </button>
            <button 
              onClick={() => setImportMode("paste")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-3 border transition-colors ${
                importMode === "paste" 
                ? "bg-primary/10 border-primary text-primary font-medium" 
                : "bg-background border-border text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <Copy className="w-5 h-5" />
              Raw Paste
            </button>
          </div>

          {/* Dynamic Area */}
          <div className="flex-1 bg-background border border-border rounded-lg min-h-0 relative">
            {importMode === "file" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-border m-4 rounded-lg bg-card/50 hover:bg-secondary/20 transition-colors cursor-pointer group">
                <div className="bg-secondary p-4 rounded-full mb-4 group-hover:scale-105 transition-transform">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="text-foreground font-medium text-lg">Drag & drop files here</p>
                <p className="text-muted-foreground text-sm mt-2">Supports Swagger, OpenAPI v3, Postman v2, HAR, Burp XML</p>
                <button 
                  onClick={handleFileBrowse}
                  className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col">
                <div className="p-3 border-b border-border bg-card/80 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Paste raw cURL, HTTP request, or Swagger JSON
                </div>
                <div className="flex-1 overflow-hidden">
                  <Editor 
                    height="100%" 
                    defaultLanguage="json" 
                    theme="vs-dark" 
                    value={pasteContent}
                    onChange={(val) => setPasteContent(val || "")}
                    options={{ minimap: { enabled: false }, roundedSelection: true, padding: { top: 16 } }}
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3 bg-card/50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-md transition-colors">
            Cancel
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md font-medium text-sm transition-colors">
            Parse & Import
          </button>
        </div>

      </div>
    </div>
  );
}
