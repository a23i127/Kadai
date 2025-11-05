import type { Repo } from "../handleSerect/handleGetRepo/fetchRepo";

/**
 * Toggleボタンがクリックされた時のハンドラー
 * @param activeRepo 現在選択されているリポジトリ
 * @param repos 全リポジトリのリスト
 * @param setRepos リポジトリリストの更新関数
 */
export const handleToggleFavorite = async (
  activeRepo: Repo | null,
  repos: Repo[],
  setRepos: (repos: Repo[]) => void
): Promise<boolean> => {
  if (!activeRepo) {
    console.warn("アクティブなリポジトリが選択されていません");
    return false;
  }

  try {
    console.log(`お気に入り切り替え開始: ${activeRepo.name} (ID: ${activeRepo.id})`);
    
    // 現在のお気に入り状態を取得
    const currentFavoriteState = activeRepo.favorite || false;
    const newFavoriteState = !currentFavoriteState;
    
    console.log(`お気に入り状態: ${currentFavoriteState} → ${newFavoriteState}`);

    // reposリスト内の該当リポジトリのfavoriteカラムを更新
    const updatedRepos = repos.map(repo => 
      repo.id === activeRepo.id 
        ? { ...repo, favorite: newFavoriteState }
        : repo
    );
    setRepos(updatedRepos);

    // 注意: activeRepoの直接変更は避け、setActiveRepoで状態更新を委ねる

    console.log(`お気に入り状態を更新: ${activeRepo.name} (favorite: ${newFavoriteState})`);

    // 注意: reposリストは既に更新済みなので、追加の操作は不要

    console.log("お気に入り切り替え完了");
    
    // 更新された状態を返す
    return newFavoriteState;
  } catch (error) {
    console.error("お気に入り切り替え中にエラーが発生しました:", error);
    throw error;
  }
};

/**
 * お気に入り状態をチェックする関数
 * @param repoId リポジトリID
 * @param favoriteRepos お気に入りリポジトリのリスト
 * @returns お気に入りの場合true
 */
export const isFavoriteRepo = (repoId: number, favoriteRepos: Repo[]): boolean => {
  return favoriteRepos.some(repo => repo.id === repoId);
};

/**
 * お気に入りリポジトリの数を取得
 * @param favoriteRepos お気に入りリポジトリのリスト
 * @returns お気に入りリポジトリの数
 */
export const getFavoriteCount = (favoriteRepos: Repo[]): number => {
  return favoriteRepos.length;
};

