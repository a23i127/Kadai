import { useEffect, useRef, useCallback } from "react";
import { DataSaveService } from "./services/dataSaveService";
import type { SaveData, UseAutoSaveOptions } from "./types/autoSaveTypes";

export const useAutoSave = ({ 
  repos, 
  allFetchedItemsDict, 
  intervalMs = 30000,
  enableBeforeUnload = true,
  enableVisibilityChange = true
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

  // 定期的な自動保存
  useEffect(() => {
    const interval = setInterval(() => {
      saveDataAutomatically();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [saveDataAutomatically, intervalMs]);

  // ブラウザ終了時/ページ離脱時の自動保存
  useEffect(() => {
    if (!enableBeforeUnload && !enableVisibilityChange) {
      return; // どちらも無効の場合はイベントリスナーを設定しない
    }

    const handleBeforeUnload = (event: Event) => {
      if (!enableBeforeUnload) return;
      
      const saveData = autoSaveDataRef.current;
      
      if (!DataSaveService.hasSaveableData(saveData)) {
        return;
      }

      // データがある場合は保存処理を実行
      saveDataAutomatically();
      
      // ブラウザに保存処理中であることを通知（オプション）
      event.preventDefault();
      if (event instanceof BeforeUnloadEvent) {
        event.returnValue = '';
      }
    };

    const handleVisibilityChange = () => {
      if (!enableVisibilityChange) return;
      
      if (document.visibilityState === 'hidden') {
        saveDataAutomatically();
      }
    };

    if (enableBeforeUnload) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    
    if (enableVisibilityChange) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (enableBeforeUnload) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      if (enableVisibilityChange) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [saveDataAutomatically, enableBeforeUnload, enableVisibilityChange]);

  return {
    saveDataAutomatically
  };
};
