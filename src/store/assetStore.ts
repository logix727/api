import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface Asset {
  id: string;
  workspace_id: string;
  method: string;
  endpoint: string;
  source: string;
  raw_request: string | null;
  raw_response: string | null;
  created_at: string;
  last_scanned: string | null;
}

export interface Finding {
  id: string;
  asset_id: string;
  category: string;
  severity: string;
  description: string;
  evidence: string | null;
  status: string;
  created_at: string;
}

interface AssetStore {
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  fetchAssets: (workspaceId: string) => Promise<void>;
  addAsset: (asset: {
    workspace_id: string;
    method: string;
    endpoint: string;
    source: string;
    raw_request: string | null;
    raw_response: string | null;
  }) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  
  findings: Record<string, Finding[]>;
  fetchFindings: (assetId: string) => Promise<void>;
  runScan: (assetId: string) => Promise<void>;
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  assets: [],
  findings: {},
  isLoading: false,
  error: null,

  fetchAssets: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const dbAssets: Asset[] = await invoke('get_assets', { workspaceId });
      set({ assets: dbAssets, isLoading: false });
    } catch (err: any) {
      set({ error: err.toString(), isLoading: false });
    }
  },

  addAsset: async (newAsset) => {
    set({ isLoading: true, error: null });
    try {
      const dbAsset: Asset = await invoke('add_asset', {
        workspaceId: newAsset.workspace_id,
        method: newAsset.method,
        endpoint: newAsset.endpoint,
        source: newAsset.source,
        rawRequest: newAsset.raw_request,
        rawResponse: newAsset.raw_response,
      });
      set((state) => ({ 
        assets: [...state.assets, dbAsset], 
        isLoading: false 
      }));
    } catch (err: any) {
      set({ error: err.toString(), isLoading: false });
    }
  },

  deleteAsset: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('delete_asset', { id });
      set((state) => ({
        assets: state.assets.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.toString(), isLoading: false });
    }
  },

  fetchFindings: async (assetId: string) => {
    try {
      const dbFindings: Finding[] = await invoke('get_findings', { assetId });
      set((state) => ({
        findings: { ...state.findings, [assetId]: dbFindings }
      }));
    } catch (err: any) {
      console.error("Failed to fetch findings", err);
    }
  },

  runScan: async (assetId: string) => {
    set({ isLoading: true });
    try {
      const newFindings: Finding[] = await invoke('run_scan_asset', { assetId });
      set((state) => ({
        findings: { ...state.findings, [assetId]: newFindings },
        isLoading: false
      }));
      // trigger refresh of assets to get new last_scanned
      get().fetchAssets("default-workspace");
    } catch (err: any) {
      set({ error: err.toString(), isLoading: false });
    }
  },
}));
