import { fetchFileOrDirContentsAction } from "../../fetchFileData/fetchFileOrDirContents";
import { fetchFileOrDirWithCache } from "../../getCash/getCash";
import type { Repo } from "../handleGetRepo/fetchRepo";
import type { FileOrDir } from "../../getCash/getCash";

export async function handleFileSelect(
  repo: Repo,
  filePath: string,
  deps: {
    setAllFetchedItemsDict: React.Dispatch<React.SetStateAction<Record<number, FileOrDir[]>>>;
    setPopUpFile: (f: FileOrDir | null) => void;
    setShowPopUp: (v: boolean) => void;
    setError: (s: string) => void;
  }
) {
  const { setAllFetchedItemsDict, setPopUpFile, setShowPopUp, setError } = deps;

  let items: FileOrDir[] = [];

  // まずキャッシュから取得を試行
  try {
    items = await fetchFileOrDirWithCache(repo.id, filePath, () => Promise.resolve([]));
  } catch {
    // キャッシュ取得失敗時は items は空のまま
  }

  // キャッシュにデータがない場合、またはcontentが空の場合にAPIから取得
  const hasValidContent = items.length > 0 && items[0]?.content && items[0].content.trim() !== "";
  
  if (items.length === 0 || !hasValidContent) {
    try {
      items = await fetchFileOrDirContentsAction(repo, filePath);
      
      if (items.length === 0) {
        setError("ファイルが見つかりません");
        return;
      }
    } catch {
      setError("ファイルの取得に失敗しました");
      return;
    }
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
}
