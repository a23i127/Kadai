import { useState } from "react";
import "./Display.css";
import { postFileOrDirBatch } from "../feacher/dbPostHandlers/fileOrDir/fileOrDirPostHandle";
import { postRepositoriesBatch } from "../feacher/dbPostHandlers/repository/repositoryHandle";
import { showRepoNameCandidates } from "../feacher/searchRepository/showRepoNameCandidate";
import type { Repo } from "../feacher/handleSerect/handleGetRepo/fetchRepo";
import type { FileOrDir as FileOrDirApi } from "../feacher/dbPostHandlers/fileOrDir/fileOrDirFactory";
import PopUp from "./popup/popUp";
import Toggle from "./toggle/toggle";
import { handleRepoSelect } from "../feacher/handleSerect/handleSerectRepo/selectRepo";
import { searchRepositories } from "../feacher/searchRepository/fuc";
import { handleDirSelect } from "../feacher/handleSerect/handleSelectDirectory/selectDirectrory";
import { handleFileSelect } from "../feacher/handleSerect/handleSelectFile/selectFile";
import { goToParentDir } from "../feacher/handleSerect/handleBackAction/handleBackAction";
import { showFavoriteReposModal } from "../feacher/favariteRepository/favariteComponent";
import { handleTagAction } from "../feacher/handleSerect/handleTagAction/handleTagAction";
import { useLoadMoreRepos } from "../feacher/hooks/useLoadMoreRepos";

// ファイル/ディレクトリ型を拡張
interface FileOrDir {
  name: string;
  url?: string;
  type?: "file" | "dir";
  path?: string;
  content?: string;
  fromCache?: boolean;
}

// DBキャッシュ優先でファイル/ディレクトリ取得

const DisplayArea = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState<FileOrDir[]>([]);
  const [activeRepo, setActiveRepo] = useState<Repo | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [allFetchedItemsDict, setAllFetchedItemsDict] = useState<Record<number, FileOrDir[]>>({});
  const [showPopUp, setShowPopUp] = useState(false);
  const [popUpFile, setPopUpFile] = useState<FileOrDir | undefined>(undefined);
  const [saveMessage, setSaveMessage] = useState("");
  const [cacheAlert, setCacheAlert] = useState("");
  // お気に入りトグルでのみ更新されるactiveRepo用State（配列化）
  const [favoriteRepos, setFavoriteRepos] = useState<Repo[]>([]);
  // 手動読み込み表示モード
  const [isLoadMoreMode, setIsLoadMoreMode] = useState(false);
  
  // 手動読み込みフック
  const {
    isLoading: loadMoreLoading,
    fetchError: loadMoreError,
    hasMore,
    loadInitialRepos,
    loadMoreRepos,
    resetRepos
  } = useLoadMoreRepos({ setRepos });

  // 検索ボタンのクリックハンドラ
  const handleSearchClick = async () => {
    // dbからリポジトリ取得して、あれば、その名前を検索候補として表示
    const repoName = await showRepoNameCandidates();
    searchRepositories(
      repoName,
      setRepos,
      setSelectedItems,
      setCurrentPath,
      setActiveRepo,
      setLoading,
      setError,
      setCacheAlert
    );
  };

  // Google組織リポジトリ（手動読み込み）のクリックハンドラ
  const handleLoadMoreClick = async () => {
    setIsLoadMoreMode(true);
    setSelectedItems([]);
    setCurrentPath("");
    setActiveRepo(null);
    resetRepos();
    await loadInitialRepos();
  };

  // 通常モードに戻るハンドラ
  const handleBackToNormalMode = () => {
    setIsLoadMoreMode(false);
    setRepos([]);
    setSelectedItems([]);
    setCurrentPath("");
    setActiveRepo(null);
  };

  const handleClickItem = async (target: Repo | FileOrDir) => {
    setLoading(true);
    setError("");
    setCacheAlert("");
    try {
      // クリック対象が Repo の場合
      if ("owner" in target) {
        const repo = target as Repo;
        await handleRepoSelect(
          repo,
          setActiveRepo,
          setCurrentPath,
          setSelectedItems,
          setAllFetchedItemsDict,
          setCacheAlert
        );
        return;
      }
      // クリック対象が FileOrDir の場合
      const item = target as FileOrDir;
      if (!activeRepo) return;
      // 📂 ディレクトリ
      if (item.type === "dir" && item.path) {
        await handleDirSelect(
          activeRepo,
          item.path,
          {
            setSelectedItems,
            setCurrentPath,
            setAllFetchedItemsDict,
            setCacheAlert,
          }
        );
        return;
      }
      // 📄 ファイル
      if (item.type === "file" && item.url && item.path) {
        await handleFileSelect(
          activeRepo,
          item.path,
          {
            setAllFetchedItemsDict,
            setPopUpFile: (f) => setPopUpFile(f ?? undefined),
            setShowPopUp,
            setCacheAlert,
            setError,
          }
        );
        return;
      }
    } catch {
      setError("データ取得に失敗しました");
      setSelectedItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 保存ボタンのハンドラ
  const handleSaveAllFetchedItems = async () => {
    setLoading(true);
    setError("");
    setSaveMessage("");
    try {
      // リポジトリデータをdb保存
      await postRepositoriesBatch(repos);
      
      // allFetchedItemsDictの各リポジトリIDごとに保存
      for (const repoIdStr of Object.keys(allFetchedItemsDict)) {
        const repoId = Number(repoIdStr);
        const items = allFetchedItemsDict[repoId];
        if (items && items.length > 0) {
          await postFileOrDirBatch(repoId, items as FileOrDirApi[]);
        }
      }
      setSaveMessage("保存が完了しました！");
    } catch {
      setError("全ファイル・ディレクトリの保存に失敗しました");
      setSaveMessage("");
    }
    setLoading(false);
  };

  // 戻る
  const handleBackClick = async () => {
    if (!activeRepo) {
      // リポジトリ一覧に戻る
      setSelectedItems([]);
      setCurrentPath("");
      setActiveRepo(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await goToParentDir(
        activeRepo,
        currentPath,
        setSelectedItems as (v: FileOrDir[]) => void,
        setCurrentPath,
        setActiveRepo as (v: Repo | null) => void
      );
    } catch {
      setError("親ディレクトリ取得に失敗しました");
      setSelectedItems([]);
    }
    setLoading(false);
  };

  // お気に入りディレクトリボタンのクリックハンドラ
  const handleFavoriteDirClick = async () => {
    const selected = await showFavoriteReposModal(favoriteRepos);
    if (selected) {
      await handleRepoSelect(
        selected,
        setActiveRepo,
        setCurrentPath,
        setSelectedItems,
        setAllFetchedItemsDict,
        setCacheAlert
      );
    } else {
      // キャンセルや未選択時
    }
  };

  return (
    <div className="display-area">
      <div className="header-container">
        <h1 className="app-title">Repository Explorer</h1>
        <div className="header-buttons">
          <button className="organization-btn search" onClick={handleSearchClick}>
            <span>🔍</span>
            検索
          </button>
          <button className="organization-btn favorite" onClick={handleFavoriteDirClick}>
            <span>⭐</span>
            お気に入り
          </button>
        </div>
      </div>
      <button className="organization-btn load-more" onClick={handleLoadMoreClick}>
        <span>📄</span>
        Googleファイル読み込む
      </button>
      {isLoadMoreMode && (
        <button className="organization-btn back-normal" onClick={handleBackToNormalMode}>
          <span>←</span>
          通常モードに戻る
        </button>
      )}
      {Object.keys(allFetchedItemsDict).length > 0 && (
        <button className="organization-btn save-all" onClick={handleSaveAllFetchedItems}>
          <span>💾</span>
          すべて保存
        </button>
      )}
      {(loading || loadMoreLoading) && <div className="loading">読み込み中...</div>}
      {(error || loadMoreError) && <div className="error">{error || loadMoreError}</div>}
      {saveMessage && (
        <div className="save-message">{saveMessage}</div>
      )}
      {cacheAlert && (
        <div className="cache-alert">{cacheAlert}</div>
      )}
      <div className="main-content-wrapper">
        <div className="main-content">
          {repos.length === 0 ? (
            <span className="empty-state">リポジトリ表示領域およびファイル表示領域</span>
          ) : (
            <ul className="repo-list">
              {selectedItems.length > 0 && (
                <div className="navigation-area">
                  <div className="navigation-left">
                    {/* activeRepo名＋星トグルを一体化 */}
                    {activeRepo && (
                      <span className="active-repo-info">
                        <span className="active-repo-name">
                          {activeRepo.name}
                        </span>
                        <Toggle onClick={() => {
                          if (activeRepo && !favoriteRepos.some(r => r.id === activeRepo.id)) {
                            setFavoriteRepos(prev => [...prev, activeRepo]);
                          }
                        }}>★</Toggle>
                      </span>
                    )}
                    <button className="organization-btn back" onClick={handleBackClick}>
                      <span>←</span>
                      一つ前に戻る
                    </button>
                  </div>
                  {/* タグ付けボタンを右端に配置 */}
                  <button 
                    className="tag-button"
                    onClick={() => handleTagAction(activeRepo, currentPath, setRepos)}
                  >
                    <span>🏷️</span>
                    タグ付け
                  </button>
                </div>
              )}
              {selectedItems.length > 0
                ? selectedItems.map((item, idx) => (
                    <li key={idx} className="repo-list-item">
                      <button className="repo-link file-dir" onClick={() => handleClickItem(item)}>
                        {item.name}
                      </button>
                    </li>
                  ))
                : repos.map((repo) => (
                    <li 
                      key={repo.id} 
                      className="repo-list-item"
                    >
                      <button className="repo-link repository" onClick={() => handleClickItem(repo)}>
                        <span>{repo.name}</span>
                        {repo.tag && (
                          <span className="repo-tag">
                            🏷️ {repo.tag}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
              
              {/* 手動読み込みモードの場合、Load Moreボタンとステータス表示 */}
              {isLoadMoreMode && (
                <li className="load-more-controls">
                  {loadMoreLoading && (
                    <div className="loading-indicator">
                      <span>🔄</span> 読み込み中...
                    </div>
                  )}
                  {!loadMoreLoading && hasMore && (
                    <button 
                      className="load-more-btn" 
                      onClick={loadMoreRepos}
                    >
                      <span>⬇️</span> さらに読み込む
                    </button>
                  )}
                  {!hasMore && repos.length > 0 && (
                    <div className="end-message">
                      すべてのリポジトリを読み込みました
                    </div>
                  )}
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
      {showPopUp && (
        <PopUp file={popUpFile} onClose={() => setShowPopUp(false)} />
      )}
    </div>
  );
};

export default DisplayArea;
