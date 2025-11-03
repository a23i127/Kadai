import { useState, useCallback } from "react";
import type { Repo } from "../handleSerect/handleGetRepo/fetchRepo";
import { handleToggleFavorite } from "./favarite";

interface UseFavoriteToggleOptions {
  activeRepo: Repo | null;
  repos: Repo[];
  setRepos: (repos: Repo[]) => void;
  setActiveRepo: (updater: (prev: Repo | null) => Repo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

/**
 * お気に入りToggle機能のカスタムフック
 */
export const useFavoriteToggle = ({
  activeRepo,
  repos,
  setRepos,
  setActiveRepo,
  setLoading,
  setError,
}: UseFavoriteToggleOptions) => {
  const [isToggling, setIsToggling] = useState(false);

  /**
   * Toggleボタンクリック時のお気に入り処理
   */
  const handleFavoriteToggle = useCallback(async () => {
    if (!activeRepo || isToggling) return;
    
    setIsToggling(true);
    
    try {
      setLoading(true);
      setError(""); // エラーメッセージをクリア
      
      // お気に入り切り替え処理を実行
      const newFavoriteState = await handleToggleFavorite(
        activeRepo,
        repos,
        setRepos
      );
      console.log(repos)
      // activeRepoの状態を確実に更新
      setActiveRepo(prev => prev ? { 
        ...prev, 
        favorite: newFavoriteState 
      } : null);
      
      console.log(`ActiveRepo更新完了: ${activeRepo.name} favorite=${newFavoriteState}`);
      
    } catch (err) {
      console.error('お気に入り更新エラー:', err);
      setError("お気に入り更新に失敗しました");
    } finally {
      setLoading(false);
      setIsToggling(false);
    }
  }, [
    activeRepo,
    isToggling,
    repos,
    setRepos,
    setActiveRepo,
    setLoading,
    setError
  ]);

  /**
   * 現在のお気に入り状態を取得
   */
  const getCurrentFavoriteState = useCallback((): boolean => {
    return activeRepo?.favorite || false;
  }, [activeRepo]);

  /**
   * お気に入り状態の表示用アイコンを取得
   */
  const getFavoriteIcon = useCallback((): string => {
    const isFavorite = getCurrentFavoriteState();
    console.log(`アイコン表示: ${activeRepo?.name} favorite=${isFavorite} icon=${isFavorite ? '★' : '☆'}`);
    return isFavorite ? '★' : '☆';
  }, [getCurrentFavoriteState, activeRepo]);

  return {
    handleFavoriteToggle,
    getCurrentFavoriteState,
    getFavoriteIcon,
    isToggling,
  };
};
