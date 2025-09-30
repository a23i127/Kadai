import { useState } from "react";
import "./Display.css";
import { fetchReposWithState } from "../feacher/fetchFileData.tsx/fetchRepo";
import { fetchFileOrDirContentsAction } from "../feacher/fetchFileData.tsx/fetchFileOrDirContents";
import type { Repo } from "../feacher/fetchFileData.tsx/fetchRepo";

// ファイル/ディレクトリ型を拡張
interface FileOrDir {
  name: string;
  url?: string;
  type?: "file" | "dir";
  path?: string;
}

const DisplayArea = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState<FileOrDir[]>([]);
  const [activeRepo, setActiveRepo] = useState<Repo | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("");

  // リポジトリクリック時
  const handleRepoClick = async (repo: Repo) => {
    setLoading(true);
    setError("");
    try {
      setActiveRepo(repo);
      setCurrentPath("");
      const items = await fetchFileOrDirContentsAction(repo, "");
      setSelectedItems(items);
    } catch {
      setError("ファイル/ディレクトリ取得に失敗しました");
      setSelectedItems([]);
    }
    setLoading(false);
  };

  // ディレクトリ・ファイルクリック時
  const handleItemClick = async (item: FileOrDir) => {
    if (!activeRepo) return;
    if (item.type === "dir" && item.path) {
      setLoading(true);
      setError("");
      try {
        const items = await fetchFileOrDirContentsAction(activeRepo, item.path);
        setSelectedItems(items);
        setCurrentPath(item.path);
      } catch {
        setError("ディレクトリ取得に失敗しました");
        setSelectedItems([]);
      }
      setLoading(false);
    } else if (item.type === "file" && item.url) {
      window.open(item.url, "_blank");
    }
  };

  // 戻る
  const handleBackClick = async () => {
    if (!activeRepo) return;
    setLoading(true);
    setError("");
    try {
      let parentPath = "";
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

  // リポジトリ一覧取得
  const handleClick = () => {
    fetchReposWithState(setRepos, setLoading, setError);
    setSelectedItems([]);
    setCurrentPath("");
    setActiveRepo(null);
  };

  return (
    <div className="display-area">
      <button className="organization-btn" onClick={handleClick} style={{ marginBottom: 24 }}>
        リポジトリ取得
      </button>
      {loading && <div className="loading">読み込み中...</div>}
      {error && <div className="error">{error}</div>}
      {repos.length === 0 ? (
        <span>リポジトリ表示領域およびファイル表示領域</span>
      ) : (
        <ul className="repo-list">
          {selectedItems.length > 0 && (
            <button className="organization-btn" style={{ marginBottom: 16, background: "#eee", color: "#333" }} onClick={handleBackClick}>
              一つ前に戻る
            </button>
          )}
          {selectedItems.length > 0
            ? selectedItems.map((item, idx) => (
                <li key={idx} className="repo-list-item">
                  <button className="repo-link" style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }} onClick={() => handleItemClick(item)}>
                    {item.name}
                  </button>
                </li>
              ))
            : repos.map(repo => (
                <li key={repo.id} className="repo-list-item">
                  <button className="repo-link" style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }} onClick={() => handleRepoClick(repo)}>
                    {repo.name}
                  </button>
                </li>
              ))}
        </ul>
      )}
    </div>
  );
};

export default DisplayArea;
