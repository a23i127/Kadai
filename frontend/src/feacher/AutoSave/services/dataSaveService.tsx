import { postFileOrDirBatch } from "../../dbPostHandlers/fileOrDir/fileOrDirPostHandle";
import { postRepositoriesBatch } from "../../dbPostHandlers/repository/repositoryHandle";
import type { Repo } from "../../handleSerect/handleGetRepo/fetchRepo";
import type { FileOrDir as FileOrDirApi } from "../../dbPostHandlers/fileOrDir/fileOrDirFactory";
import type { SaveData, FileOrDir } from "../types/autoSaveTypes";

// データ保存クラス
export class DataSaveService {
  /**
   * 全データを保存する
   * @param saveData 保存するデータ
   */
  static async saveAllData(saveData: SaveData): Promise<void> {
    const { repos, allFetchedItemsDict } = saveData;
    
    if (repos.length === 0 && Object.keys(allFetchedItemsDict).length === 0) {
      return; // 保存するデータがない場合はスキップ
    }

    try {
      // リポジトリデータを保存
      if (repos.length > 0) {
        await this.saveRepositories(repos);
      }

      // ファイル/ディレクトリデータを保存
      await this.saveFileOrDirData(allFetchedItemsDict);
    } catch (error) {
      console.error('データ保存中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * リポジトリデータを保存する
   * @param repos 保存するリポジトリデータ
   */
  private static async saveRepositories(repos: Repo[]): Promise<void> {
    try {
      await postRepositoriesBatch(repos);
    } catch (error) {
      console.error('リポジトリデータの保存に失敗しました:', error);
      throw error;
    }
  }

  /**
   * ファイル/ディレクトリデータを保存する
   * @param allFetchedItemsDict 保存するファイル/ディレクトリデータ
   */
  private static async saveFileOrDirData(
    allFetchedItemsDict: Record<number, FileOrDir[]>
  ): Promise<void> {
    const savePromises: Promise<void>[] = [];

    for (const repoIdStr of Object.keys(allFetchedItemsDict)) {
      const repoId = Number(repoIdStr);
      const items = allFetchedItemsDict[repoId];
      
      if (items && items.length > 0) {
        savePromises.push(this.saveFileOrDirForRepo(repoId, items));
      }
    }

    try {
      await Promise.all(savePromises);
    } catch (error) {
      console.error('ファイル/ディレクトリデータの保存に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 特定のリポジトリのファイル/ディレクトリデータを保存する
   * @param repoId リポジトリID
   * @param items 保存するアイテム
   */
  private static async saveFileOrDirForRepo(
    repoId: number, 
    items: FileOrDir[]
  ): Promise<void> {
    try {
      await postFileOrDirBatch(repoId, items as FileOrDirApi[]);
    } catch (error) {
      console.error(`リポジトリID ${repoId} のファイル/ディレクトリデータの保存に失敗しました:`, error);
      throw error;
    }
  }

  /**
   * 保存対象データがあるかチェックする
   * @param saveData チェックするデータ
   * @returns 保存対象データがある場合はtrue
   */
  static hasSaveableData(saveData: SaveData): boolean {
    const { repos, allFetchedItemsDict } = saveData;
    return repos.length > 0 || Object.keys(allFetchedItemsDict).length > 0;
  }
}
