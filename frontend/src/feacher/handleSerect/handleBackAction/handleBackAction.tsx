import { fetchFileOrDirContentsAction } from "../../fetchFileData/fetchFileOrDirContents";
import type { Repo } from "../../fetchFileData/fetchRepo";
import type { FileOrDir } from "../../getCash/getCash";

// リポジトリ一覧に戻る
export function resetToRepoList(
  setSelectedItems: (v: FileOrDir[]) => void,
  setCurrentPath: (v: string) => void,
  setActiveRepo: (v: Repo | null) => void
) {
  setSelectedItems([]);
  setCurrentPath("");
  setActiveRepo(null);
}

// 親ディレクトリへ戻る（API優先。キャッシュにしたいなら中を差し替え）
export async function goToParentDir(
  repo: Repo,
  currentPath: string,
  setSelectedItems: (v: FileOrDir[]) => void,
  setCurrentPath: (v: string) => void,
  setActiveRepo: (v: Repo | null) => void
) {
  // ルートなら一覧へ
  if (!currentPath) {
    resetToRepoList(setSelectedItems, setCurrentPath, setActiveRepo);
    return;
  }
  // 親パス計算
  const parentPath =
    currentPath.includes("/") ? currentPath.substring(0, currentPath.lastIndexOf("/")) : "";
  // 取得（キャッシュ優先にしたい場合は fetchFileOrDirWithCache に変更可）
  const parentItems = await fetchFileOrDirContentsAction(repo, parentPath);
  setSelectedItems(parentItems);
  setCurrentPath(parentPath);
}
