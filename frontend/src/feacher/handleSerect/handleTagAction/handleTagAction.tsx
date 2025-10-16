import type { Repo } from "../../fetchFileData/fetchRepo";

/**
 * タグ付けアクションハンドラー - reposのstateを更新
 * @param activeRepo - 現在選択されているリポジトリ
 * @param currentPath - 現在のパス
 * @param setRepos - reposのstate更新関数
 */
export const handleTagAction = async (
  activeRepo: Repo | null,
  currentPath: string,
  setRepos: (updateFn: (prevRepos: Repo[]) => Repo[]) => void
): Promise<void> => {
  try {
    if (!activeRepo) {
      console.log("タグ付け: リポジトリが選択されていません");
      return;
    }

    // タグ付けのダイアログを表示
    const tagName = prompt(
      `${activeRepo.name}${currentPath ? ` (${currentPath})` : ""} にタグを付けますか？`, 
      activeRepo.tag || "important"
    );
    
    if (tagName !== null && tagName.trim()) {
      // reposのstateを更新
      setRepos((prevRepos) => 
        prevRepos.map((repo) =>
          repo.id === activeRepo.id
            ? { ...repo, tag: tagName.trim() }
            : repo
        )
      );
      
      console.log(`タグ付け実行: リポジトリ=${activeRepo.name}, パス=${currentPath}, タグ=${tagName.trim()}`);
      
      // TODO: バックエンドAPIでタグを保存
      // await saveTag(activeRepo.id, currentPath, tagName.trim());
      
      alert(`「${tagName.trim()}」タグを追加しました！`);
    }
  } catch (error) {
    console.error("タグ付け処理でエラーが発生しました:", error);
    alert("タグ付けに失敗しました");
  }
};
