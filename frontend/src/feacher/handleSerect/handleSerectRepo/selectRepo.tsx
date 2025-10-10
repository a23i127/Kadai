import { fetchFileOrDirWithCache } from "../../getCash/getCash";
import { fetchFileOrDirContentsAction } from "../../fetchFileData/fetchFileOrDirContents";
import type { Repo } from "../../fetchFileData/fetchRepo";
import type { FileOrDir } from "../../getCash/getCash";


export const handleRepoSelect = async (
  repo: Repo,
  setActiveRepo: (repo: Repo) => void,
  setCurrentPath: (path: string) => void,
  setSelectedItems: (items: FileOrDir[]) => void,
  setAllFetchedItemsDict: React.Dispatch<React.SetStateAction<Record<number, FileOrDir[]>>>,
  setCacheAlert: (msg: string) => void
) => {
  setActiveRepo(repo);
  setCurrentPath("");

  // DBキャッシュ優先で取得
  const items = await fetchFileOrDirWithCache(
    repo.id,
    "",
    () => fetchFileOrDirContentsAction(repo, "")
  );

  setSelectedItems(items);

  // キャッシュに追加
  if (repo.id) {
    setAllFetchedItemsDict(prev => ({
      ...prev,
      [repo.id]: [...(prev[repo.id] ?? []), ...items],
    }));
  }

  // キャッシュから取得した場合はアラート表示
  if (items.length > 0 && items[0].fromCache) {
    setCacheAlert("キャッシュから取得しました");
  }
};
