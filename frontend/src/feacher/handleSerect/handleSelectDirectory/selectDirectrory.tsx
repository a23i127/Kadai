import { fetchFileOrDirWithCache } from "../../getCash/getCash";
import { fetchFileOrDirContentsAction } from "../../fetchFileData/fetchFileOrDirContents";
import type { Repo } from "../../fetchFileData/fetchRepo";
import type { FileOrDir } from "../../getCash/getCash";

export async function handleDirSelect(
  repo: Repo,
  dirPath: string,
  deps: {
    setSelectedItems: (v: FileOrDir[]) => void;
    setCurrentPath: (v: string) => void;
    setAllFetchedItemsDict: React.Dispatch<React.SetStateAction<Record<number, FileOrDir[]>>>;
    setCacheAlert: (v: string) => void;
  }
) {
  const { setSelectedItems, setCurrentPath, setAllFetchedItemsDict, setCacheAlert } = deps;

  const items = await fetchFileOrDirWithCache(
    repo.id,
    dirPath,
    () => fetchFileOrDirContentsAction(repo, dirPath)
  );

  setSelectedItems(items);
  setCurrentPath(dirPath);

  if (repo.id) {
    setAllFetchedItemsDict(prev => ({
      ...prev,
      [repo.id]: [...(prev[repo.id] ?? []), ...items],
    }));
  }

  if (items.length > 0 && items[0] && (items[0] as FileOrDir).fromCache) {
    setCacheAlert("キャッシュから取得しました");
  }
}
