import { useState } from "react";
import "./Display.css";
import { showRepoNameCandidates } from "../feacher/searchRepository/showRepoNameCandidate";
import type { Repo } from "../feacher/handleSerect/handleGetRepo/fetchRepo";
import type { FileOrDir } from "../feacher/AutoSave/types/autoSaveTypes";
import PopUp from "./popup/popUp";
import Toggle from "./toggle/toggle";
import { handleRepoSelect } from "../feacher/handleSerect/handleSerectRepo/selectRepo";
import { searchRepositories } from "../feacher/searchRepository/fuc";
import { handleDirSelect } from "../feacher/handleSerect/handleSelectDirectory/selectDirectrory";
import { handleFileSelect } from "../feacher/handleSerect/handleSelectFile/selectFile";
import { goToParentDir } from "../feacher/handleSerect/handleBackAction/handleBackAction";
import { showFavoriteReposModal } from "../feacher/handleSerect/handleSelectFavorite/favariteComponent";
import { handleTagAction } from "../feacher/handleSerect/handleTagAction/handleTagAction";
import { useLoadMoreRepos } from "../feacher/handleSerect/handleGetRepo/useLoadMoreRepos";
import { useAutoSave } from "../feacher/AutoSave/useAutoSave";
import { useFavoriteToggle } from "../feacher/favariteRepository/useFavoriteToggle";

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

  // 自動保存フック
  useAutoSave({ repos, allFetchedItemsDict });

  // お気に入りToggle機能フック
  const { handleFavoriteToggle, getFavoriteIcon } = useFavoriteToggle({
    activeRepo,
    repos,
    setRepos,
    setActiveRepo,
    setLoading,
    setError,
  });

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
      setError
    );
  };

  // Google組織リポジトリ（手動読み込み）のクリックハンドラ
  const handleLoadMoreClick = async () => {
    // 1回目：手動読み込みモードに入り、APIを呼ぶ
    if (!isLoadMoreMode) {
      setIsLoadMoreMode(true);
      setSelectedItems([]);
      setCurrentPath("");
      setActiveRepo(null);
      resetRepos();
      await loadInitialRepos();
    } else {
      // 2回目以降：潜った階層をリセット（APIは呼ばない）
      setSelectedItems([]);
      setCurrentPath("");
      setActiveRepo(null);
      resetScrollPosition(); // スクロール位置もリセット
    }
  };

  // 通常モードに戻るハンドラ
  const handleBackToNormalMode = () => {
    setIsLoadMoreMode(false);
    setRepos([]);
    setSelectedItems([]);
    setCurrentPath("");
    setActiveRepo(null);
  };

  // スクロール位置をリセットする関数
  const resetScrollPosition = () => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  };

  const handleClickItem = async (target: Repo | FileOrDir) => {
    setLoading(true);
    setError("");
    try {
      // クリック対象が Repo の場合
      if ("owner" in target) {
        const repo = target as Repo;
        await handleRepoSelect(
          repo,
          setActiveRepo,
          setCurrentPath,
          setSelectedItems,
          setAllFetchedItemsDict
        );
        resetScrollPosition(); // リポジトリ選択時にスクロールリセット
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
          }
        );
        resetScrollPosition(); // ディレクトリ移動時にスクロールリセット
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
            setError,
          }
        );
        // ファイル選択時はポップアップが開くだけなのでスクロールリセットは不要
        return;
      }
    } catch {
      setError("データ取得に失敗しました");
      setSelectedItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 戻る
  const handleBackClick = async () => {
    if (!activeRepo) {
      // リポジトリ一覧に戻る
      setSelectedItems([]);
      setCurrentPath("");
      setActiveRepo(null);
      resetScrollPosition(); // リポジトリ一覧に戻る時にスクロールリセット
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
      resetScrollPosition(); // 親ディレクトリに戻る時にスクロールリセット
    } catch {
      setError("親ディレクトリ取得に失敗しました");
      setSelectedItems([]);
    }
    setLoading(false);
  };

  const handleFavoriteDirClick = async () => {
    const selected = await showFavoriteReposModal();
    console.log("お気に入りリポジトリ選択結果:", selected);
    
    if (!selected) return;

    // リポジトリリストに追加（重複チェック）
    setRepos(prevRepos => {
      const exists = prevRepos.some(repo => repo.id === selected.id);
      return exists ? prevRepos : [...prevRepos, selected];
    });
    
    // リポジトリの内容を取得して表示
    await handleRepoSelect(
      selected,
      setActiveRepo,
      setCurrentPath,
      setSelectedItems,
      setAllFetchedItemsDict
    );
    resetScrollPosition(); // お気に入りリポジトリ選択時にスクロールリセット
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
        <span>{isLoadMoreMode ? "🔄" : "📄"}</span>
        {isLoadMoreMode ? "一覧に戻る" : "Googleファイル読み込む"}
      </button>
      {isLoadMoreMode && (
        <button className="organization-btn back-normal" onClick={handleBackToNormalMode}>
          <span>←</span>
          通常モードに戻る
        </button>
      )}
      {(loading || loadMoreLoading) && <div className="loading">読み込み中...</div>}
      {(error || loadMoreError) && <div className="error">{error || loadMoreError}</div>}
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
                        <Toggle onClick={handleFavoriteToggle}>
                          {getFavoriteIcon()}
                        </Toggle>
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
