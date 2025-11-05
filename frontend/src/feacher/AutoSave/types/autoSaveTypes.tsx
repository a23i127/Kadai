import type { Repo } from "../../handleSerect/handleGetRepo/fetchRepo";

// ファイル/ディレクトリ型を拡張（DisplayAreaと共通）
export interface FileOrDir {
  name: string;
  url?: string;
  type?: "file" | "dir";
  path?: string;
  content?: string;
  repo_id?: number; // API互換性のため追加
}

// 保存データの型定義
export interface SaveData {
  repos: Repo[];
  allFetchedItemsDict: Record<number, FileOrDir[]>;
}

// 自動保存設定の型定義
export interface UseAutoSaveOptions {
  repos: Repo[];
  allFetchedItemsDict: Record<number, FileOrDir[]>;
  enableBeforeUnload?: boolean;
}
