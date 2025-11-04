import { useEffect, useRef, useCallback } from "react";
import { DataSaveService } from "./services/dataSaveService";
import type { SaveData, UseAutoSaveOptions } from "./types/autoSaveTypes";

export const useAutoSave = ({ 
  repos, 
  allFetchedItemsDict, 
  enableBeforeUnload = true
}: UseAutoSaveOptions) => {
  // 自動保存データを保持するref
  const autoSaveDataRef = useRef<SaveData>({ repos: [], allFetchedItemsDict: {} });

  // 最新データでrefを更新
  useEffect(() => {
    autoSaveDataRef.current = { repos, allFetchedItemsDict };
  }, [repos, allFetchedItemsDict]);

  // 自動保存関数
  const saveDataAutomatically = useCallback(async () => {
    const saveData = autoSaveDataRef.current;
    
    if (!DataSaveService.hasSaveableData(saveData)) {
      return; // 保存するデータがない場合はスキップ
    }

    try {
      await DataSaveService.saveAllData(saveData);
    } catch (error) {
      console.warn('自動保存中にエラーが発生しました:', error);
    }
  }, []);

  // ブラウザ終了時の自動保存のみ
  useEffect(() => {
    if (!enableBeforeUnload) {
      return; // 無効の場合はイベントリスナーを設定しない
    }

    const handleBeforeUnload = () => {
      const saveData = autoSaveDataRef.current;
      
      if (!DataSaveService.hasSaveableData(saveData)) {
        return;
      }

      // データがある場合は同期的に保存処理を実行
      DataSaveService.saveAllDataSync(saveData);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveDataAutomatically, enableBeforeUnload]);

  return {
    saveDataAutomatically
  };
};
