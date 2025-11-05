import { useState } from "react";
import "./Display.css";
import { postFileOrDirBatch } from "../feacher/dbPostHandlers/fileOrDir/fileOrDirPostHandle";
import { showRepoNameCandidates } from "../feacher/searchRepository/showRepoNameCandidate";
import type { Repo } from "../feacher/fetchFileData/fetchRepo";
import type { FileOrDir as FileOrDirApi } from "../feacher/dbPostHandlers/fileOrDir/fileOrDirFactory";
import PopUp from "./popup/popUp";
import Toggle from "./toggle/toggle";
import { handleRepoSelect } from "../feacher/handleSerect/handleSerectRepo/selectRepo";
import { handleFetchAllRepos } from "../feacher/handleSerect/hadleGetAllRepo/getAllRepo";
import { searchRepositories } from "../feacher/searchRepository/fuc";
import { handleDirSelect } from "../feacher/handleSerect/handleSelectDirectory/selectDirectrory";
import { handleFileSelect } from "../feacher/handleSerect/handleSelectFile/selectFile";
import { goToParentDir } from "../feacher/handleSerect/handleBackAction/handleBackAction";
import { showFavoriteReposModal } from "../feacher/favariteRepository/favariteComponent";
import { handleTagAction } from "../feacher/handleSerect/handleTagAction/handleTagAction";
import { useAutoSave } from "../feacher/AutoSave/useAutoSave";

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

  // 自動保存フック
  useAutoSave({ repos, allFetchedItemsDict });

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

  const handleClickItem = async (target: Repo | FileOrDir | null) => {
    setLoading(true);
    setError("");
    setCacheAlert("");
    try {
      if (target === null) {
        // リポジトリ一覧取得（キャッシュ優先）
        await handleFetchAllRepos(
          setRepos,
          setSelectedItems,
          setCurrentPath,
          setActiveRepo,
          setLoading,
          setError
        );
        return;
      }
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
    <div className="display-area" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #fff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 48 }}>
      <div style={{ width: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, position: 'relative' }}>
        <h1 style={{ color: '#222', fontWeight: 'bold', fontSize: '2.2em', letterSpacing: '0.04em', margin: 0 }}>Repository Explorer</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="organization-btn" style={{ background: '#fff', color: '#6366f1', border: '1.5px solid #6366f1', borderRadius: 10, fontWeight: 'bold', fontSize: '1.1em', padding: '10px 32px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.10)', transition: 'background 0.2s, color 0.2s' }} onClick={handleSearchClick}>
            🔍 検索
          </button>
          <button className="favorite-dir-btn" style={{ background: 'linear-gradient(90deg, #60a5fa 0%, #6366f1 100%)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 'bold', fontSize: '1.05em', padding: '10px 22px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.10)', transition: 'background 0.2s' }} onClick={handleFavoriteDirClick}>
            お気に入りディレクトリ
          </button>
        </div>
      </div>
      <button className="organization-btn" onClick={() => handleClickItem(null)} style={{ marginBottom: 24, background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)', color: '#fff', fontWeight: 'bold', fontSize: '1.15em', borderRadius: 10, padding: '12px 32px', boxShadow: '0 2px 8px rgba(99,102,241,0.10)', border: 'none', letterSpacing: '0.04em', transition: 'background 0.2s' }}>
        リポジトリ取得
      </button>
      {Object.keys(allFetchedItemsDict).length > 0 && (
        <button className="organization-btn" onClick={handleSaveAllFetchedItems} style={{ marginBottom: 24, background: '#4caf50', color: '#fff', boxShadow: '0 2px 8px rgba(76,175,80,0.2)', fontWeight: 'bold', fontSize: '1.1em', letterSpacing: '0.05em', borderRadius: 10, padding: '10px 32px', border: 'none' }}>
          すべて保存
        </button>
      )}
      {loading && <div className="loading" style={{ marginBottom: 16 }}>読み込み中...</div>}
      {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}
      {saveMessage && (
        <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: 16, fontSize: '1.1em', borderRadius: 8, background: '#e8f5e9', padding: '8px 16px', boxShadow: '0 2px 8px rgba(76,175,80,0.10)' }}>{saveMessage}</div>
      )}
      {cacheAlert && (
        <div style={{ background: '#ffe082', color: '#333', fontWeight: 'bold', marginBottom: 16, fontSize: '1.1em', borderRadius: 8, padding: '8px 16px', boxShadow: '0 2px 8px rgba(255,193,7,0.15)' }}>{cacheAlert}</div>
      )}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 650, background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(99,102,241,0.10)', padding: 40, marginTop: 16, minHeight: 400 }}>
          {repos.length === 0 ? (
            <span style={{ color: '#888', fontSize: '1.15em', fontWeight: 'bold', letterSpacing: '0.03em' }}>リポジトリ表示領域およびファイル表示領域</span>
          ) : (
            <ul className="repo-list" style={{ padding: 0 }}>
              {selectedItems.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* activeRepo名＋星トグルを一体化 */}
                    {activeRepo && (
                      <span style={{ display: 'flex', alignItems: 'center', marginRight: 16, background: '#eef2ff', borderRadius: 8, padding: '6px 16px' }}>
                        <span style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '1.08em', marginRight: 8 }}>
                          {activeRepo.name}
                        </span>
                        <Toggle onClick={() => {
                          if (activeRepo && !favoriteRepos.some(r => r.id === activeRepo.id)) {
                            setFavoriteRepos(prev => [...prev, activeRepo]);
                          }
                        }}>★</Toggle>
                      </span>
                    )}
                    <button className="organization-btn" style={{ background: "#eee", color: "#333", fontWeight: 'bold', fontSize: '1em', borderRadius: 8, padding: '8px 24px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} onClick={handleBackClick}>
                      ← 一つ前に戻る
                    </button>
                  </div>
                  {/* タグ付けボタンを右端に配置 */}
                  <button 
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: '0.9em',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleTagAction(activeRepo, currentPath)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    🏷️ タグ付け
                  </button>
                </div>
              )}
              {selectedItems.length > 0
                ? selectedItems.map((item, idx) => (
                    <li key={idx} className="repo-list-item" style={{ marginBottom: 10, borderRadius: 8, background: '#f3f4f6', boxShadow: '0 1px 4px rgba(99,102,241,0.04)', padding: '8px 0' }}>
                      <button className="repo-link" style={{ background: "#222", color: "#39ff14", border: "none", padding: '10px 20px', borderRadius: 8, cursor: "pointer", fontWeight: 'bold', fontSize: '1.08em', width: '100%', textAlign: 'left', transition: 'background 0.2s', letterSpacing: '0.02em' }} onClick={() => handleClickItem(item)}>
                        {item.name}
                      </button>
                    </li>
                  ))
                : repos.map(repo => (
                    <li key={repo.id} className="repo-list-item" style={{ marginBottom: 10, borderRadius: 8, background: '#f3f4f6', boxShadow: '0 1px 4px rgba(99,102,241,0.04)', padding: '8px 0' }}>
                      <button className="repo-link" style={{ background: "linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)", color: "#fff", border: "none", padding: '14px 28px', borderRadius: 10, cursor: "pointer", fontWeight: 'bold', fontSize: '1.13em', width: '100%', textAlign: 'left', boxShadow: '0 2px 8px rgba(99,102,241,0.10)', transition: 'background 0.2s', letterSpacing: '0.03em' }} onClick={() => handleClickItem(repo)}>
                        {repo.name}
                      </button>
                    </li>
                  ))}
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
