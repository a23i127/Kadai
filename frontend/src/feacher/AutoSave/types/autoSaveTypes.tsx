import type { Repo } from "../../handleSerect/handleGetRepo/fetchRepo";

// ファイル/ディレクトリ型
export interface FileOrDir {
  name: string;
  url?: string;
  type?: "file" | "dir";
  path?: string;
  content?: string;
  fromCache?: boolean;
}

// 保存データの型定義
export interface SaveData {
  repos: Repo[];
  allFetchedItemsDict: Record<number, FileOrDir[]>;
}

// 自動保存設定の型定義
export interface AutoSaveConfig {
  intervalMs?: number; // 自動保存の間隔（デフォルト: 30秒）
  enableBeforeUnload?: boolean; // ブラウザ終了時の自動保存を有効にするか
  enableVisibilityChange?: boolean; // タブ非表示時の自動保存を有効にするか
}

// 自動保存フック用オプションの型定義
export interface UseAutoSaveOptions extends AutoSaveConfig {
  repos: Repo[];
  allFetchedItemsDict: Record<number, FileOrDir[]>;
}
