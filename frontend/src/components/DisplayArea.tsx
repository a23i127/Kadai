import { useState } from "react";
import "./Display.css";
import { fetchFileOrDirContentsAction } from "../feacher/fetchFileData/fetchFileOrDirContents";
import { postFileOrDirBatch } from "../feacher/dbPostHandlers/fileOrDir/fileOrDirPostHandle";
import { postRepositoriesBatch } from "../feacher/dbPostHandlers/repository/repositoryHandle";
import { fetchReposWithCache, fetchFileOrDirWithCache } from "../feacher/getCash/getCash";
import { searchRepositories } from "../feacher/searchRepository/fuc";
import type { Repo } from "../feacher/fetchFileData/fetchRepo";
import type { FileOrDir as FileOrDirApi } from "../feacher/dbPostHandlers/fileOrDir/fileOrDirFactory";
import PopUp from "./popup/popUp";

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

  // 検索API呼び出し関数
  

  // 検索ボタンのクリックハンドラ
  const handleSearchClick = () => {
    const repoName = window.prompt("検索したいリポジトリ名を入力してください（空欄で全件取得）", "");
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
        await fetchReposWithCache(//ok
          (newRepos: Repo[]) => {
            setRepos(newRepos);
            setSelectedItems([]);
            setCurrentPath("");
            setActiveRepo(null);
            // すべてのリポジトリ情報をDB保存APIに送信
            console.log("Repos fetched:", newRepos);
            
            if (newRepos.length > 0) {
              postRepositoriesBatch(newRepos);
            }
          },
          setLoading,
          setError
        );
        return;
      }
      // クリック対象が Repo の場合
      if ("owner" in target) {
        const repo = target as Repo;
        setActiveRepo(repo);
        setCurrentPath("");
        // DBキャッシュ優先で取得
        const items = await fetchFileOrDirWithCache(//ok
          repo.id,
          "",
          () => fetchFileOrDirContentsAction(repo, "") //ok
        );
        setSelectedItems(items);
        // キャッシュに追加
        if (repo.id) {
          setAllFetchedItemsDict(prev => ({
            ...prev,
            [repo.id]: [...(prev[repo.id] ?? []), ...items]
          }));
        }
        // キャッシュから取得した場合はアラート表示
        if (items.length > 0 && items[0].fromCache) {
          setCacheAlert("キャッシュから取得しました");
        }
        return;
      }
      // クリック対象が FileOrDir の場合
      const item = target as FileOrDir;
      if (!activeRepo) return;
      // 📂 ディレクトリ
      if (item.type === "dir" && item.path) {
        // DBキャッシュ優先で取得
        const items = await fetchFileOrDirWithCache(
          activeRepo.id,
          item.path,
          () => fetchFileOrDirContentsAction(activeRepo, item.path)
        );
        setSelectedItems(items);
        setCurrentPath(item.path);
        if (activeRepo.id) {
          setAllFetchedItemsDict(prev => ({
            ...prev,
            [activeRepo.id]: [...(prev[activeRepo.id] ?? []), ...items]
          }));
        }
        if (items.length > 0 && items[0].fromCache) {
          setCacheAlert("キャッシュから取得しました");
        }
        return;
      }
      // 📄 ファイル
      if (item.type === "file" && item.url && item.path) {
        // DBキャッシュ優先で取得
        const items = await fetchFileOrDirWithCache(
          activeRepo.id,
          item.path,
          () => fetchFileOrDirContentsAction(activeRepo, item.path) 
        );
        if (items.length > 0) {
          const fileWithContent = items[0];
          if (activeRepo.id) {
            setAllFetchedItemsDict(prev => ({
              ...prev,
              [activeRepo.id]: [...(prev[activeRepo.id] ?? []), fileWithContent]
            }));
          }
          setPopUpFile(fileWithContent);
          setShowPopUp(true);
          if (fileWithContent.fromCache) {
            setCacheAlert("キャッシュから取得しました");
          }
          return;
        }
        // キャッシュがなければAPIで取得（fetchFileOrDirWithCacheのfallbackで取得済み）
        setError("ファイルが見つかりません");
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
      let parentPath = "";
      if (currentPath === "") {
        // ルートディレクトリならリポジトリ一覧に戻る
        setSelectedItems([]);
        setCurrentPath("");
        setActiveRepo(null);
        setLoading(false);
        return;
      }
      if (currentPath.includes("/")) {
        parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
      }
      const parentItems = await fetchFileOrDirContentsAction(activeRepo, parentPath);
      setSelectedItems(parentItems);
      setCurrentPath(parentPath);
    } catch {
      setError("親ディレクトリ取得に失敗しました");
      setSelectedItems([]);
    }
    setLoading(false);
  };

  return (
    <div className="display-area" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #fff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 48 }}>
      <div style={{ width: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: '#222', fontWeight: 'bold', fontSize: '2.2em', letterSpacing: '0.04em', margin: 0 }}>Repository Explorer</h1>
        <button className="organization-btn" style={{ background: '#fff', color: '#6366f1', border: '1.5px solid #6366f1', borderRadius: 10, fontWeight: 'bold', fontSize: '1.1em', padding: '10px 32px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.10)', marginLeft: 16, transition: 'background 0.2s, color 0.2s' }} onClick={handleSearchClick}>
          🔍 検索
        </button>
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
                <button className="organization-btn" style={{ marginBottom: 16, background: "#eee", color: "#333", fontWeight: 'bold', fontSize: '1em', borderRadius: 8, padding: '8px 24px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} onClick={handleBackClick}>
                  ← 一つ前に戻る
                </button>
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
