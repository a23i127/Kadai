import { fetchFileOrDirContentsAction } from "../../fetchFileData/fetchFileOrDirContents";
import { fetchFileOrDirWithCache } from "../../getCash/getCash";
import type { Repo } from "../../fetchFileData/fetchRepo";
import type { FileOrDir } from "../../getCash/getCash";

export async function handleFileSelect(
  repo: Repo,
  filePath: string,
  deps: {
    setAllFetchedItemsDict: React.Dispatch<React.SetStateAction<Record<number, FileOrDir[]>>>;
    setPopUpFile: (f: FileOrDir | null) => void;
    setShowPopUp: (v: boolean) => void;
    setCacheAlert: (v: string) => void;
    setError: (s: string) => void;
  }
) {
  const { setAllFetchedItemsDict, setPopUpFile, setShowPopUp, setCacheAlert, setError } = deps;

  let items: FileOrDir[] = [];
  try {
    items = await fetchFileOrDirContentsAction(repo, filePath); // API優先
  } catch {
    items = await fetchFileOrDirWithCache(repo.id, filePath, () => Promise.resolve([]));
  }

  if (items.length === 0) {
    setError("ファイルが見つかりません");
    return;
  }

  const fileWithContent = items[0];

  if (repo.id) {
    setAllFetchedItemsDict(prev => ({
      ...prev,
      [repo.id]: [...(prev[repo.id] ?? []), fileWithContent],
    }));
  }

  setPopUpFile(fileWithContent);
  setShowPopUp(true);

  if ((fileWithContent as FileOrDir)?.fromCache) {
    setCacheAlert("キャッシュから取得しました");
  }
}
