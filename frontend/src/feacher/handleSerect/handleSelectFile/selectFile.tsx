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
  let fromCache = false;

  // まずキャッシュから取得を試行
  try {
    items = await fetchFileOrDirWithCache(repo.id, filePath, () => Promise.resolve([]));
    if (items.length > 0) {
      fromCache = true;
    }
  } catch {
    // キャッシュ取得失敗時は items は空のまま
  }

  // キャッシュにデータがない場合、またはcontentが空の場合にAPIから取得
  const hasValidContent = items.length > 0 && items[0]?.content && items[0].content.trim() !== "";
  
  if (items.length === 0 || !hasValidContent) {
    try {
      setCacheAlert("APIからファイルを取得中...");
      items = await fetchFileOrDirContentsAction(repo, filePath);
      fromCache = false; // APIから取得した場合はキャッシュフラグをfalseに
      
      if (items.length === 0) {
        setError("ファイルが見つかりません");
        return;
      }
    } catch {
      setError("ファイルの取得に失敗しました");
      return;
    }
  }

  // 取得元を通知
  setCacheAlert(fromCache ? "キャッシュからファイルを取得しました" : "APIからファイルを取得しました");

  const fileWithContent = items[0];

  if (repo.id) {
    setAllFetchedItemsDict(prev => ({
      ...prev,
      [repo.id]: [...(prev[repo.id] ?? []), fileWithContent],
    }));
  }

  setPopUpFile(fileWithContent);
  setShowPopUp(true);

  // キャッシュアラートは上記で既に設定済み
}
