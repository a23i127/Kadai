import { postRepositoriesBatch } from "../../dbPostHandlers/repository/repositoryHandle";
import { postFileOrDirBatch } from "../../dbPostHandlers/fileOrDir/fileOrDirPostHandle";
import type { SaveData } from "../types/autoSaveTypes";
import type { FileOrDir as FileOrDirApi } from "../../dbPostHandlers/fileOrDir/fileOrDirFactory";

export class DataSaveService {
  // 保存するデータがあるかチェック
  static hasSaveableData(saveData: SaveData): boolean {
    return Object.keys(saveData.allFetchedItemsDict).length > 0;
  }

  // 非同期でデータを保存
  static async saveAllData(saveData: SaveData): Promise<void> {
    if (!this.hasSaveableData(saveData)) {
      return;
    }

    try {
      // リポジトリデータの保存
      if (saveData.repos.length > 0) {
        await postRepositoriesBatch(saveData.repos);
      }

      // ファイル/ディレクトリデータの保存
      for (const [repoIdStr, items] of Object.entries(saveData.allFetchedItemsDict)) {
        const repoId = Number(repoIdStr);
        if (items && items.length > 0) {
          // DisplayArea型からAPI型に変換
          const apiItems: FileOrDirApi[] = items.map(item => ({
            ...item,
            repo_id: item.repo_id || repoId,
            path: item.path || '',
            type: item.type || 'file'
          }));
          await postFileOrDirBatch(repoId, apiItems);
        }
      }
    } catch (error) {
      console.error('データ保存中にエラーが発生しました:', error);
      throw error;
    }
  }

  // 同期的にデータを保存（ブラウザ終了時用）
  static saveAllDataSync(saveData: SaveData): void {
    if (!this.hasSaveableData(saveData)) {
      return;
    }

    try {
      const data = JSON.stringify(saveData);
      
      // sendBeaconを使用してデータを送信
      if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon('/api/autosave', blob);
      }
    } catch (error) {
      console.warn('同期データ保存中にエラーが発生しました:', error);
    }
  }
}
