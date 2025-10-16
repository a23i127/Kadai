import type { Repo } from "../../fetchFileData/fetchRepo";

/**
 * タグ付けアクションのサンプルハンドラー
 * @param activeRepo - 現在選択されているリポジトリ
 * @param currentPath - 現在のパス
 */
export const handleTagAction = async (
  activeRepo: Repo | null,
  currentPath: string
): Promise<void> => {
  try {
    if (!activeRepo) {
      console.log("タグ付け: リポジトリが選択されていません");
      return;
    }

    // サンプル処理：タグ付けのダイアログを表示
    const tagName = prompt(`${activeRepo.name}${currentPath ? ` (${currentPath})` : ""} にタグを付けますか？`, "important");
    
    if (tagName && tagName.trim()) {
      // ここで実際のタグ付けAPI呼び出しを行う
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
