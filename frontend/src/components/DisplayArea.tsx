import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  content?: string;
}

const DisplayArea = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState<FileOrDir[]>([]);
  const [activeRepo, setActiveRepo] = useState<Repo | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("");
  const navigate = useNavigate();

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
    console.log("Item clicked:", item);
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
    } else if (item.type === "file" && item.url && item.path && activeRepo) {
      setLoading(true);
      setError("");
      try {
        // owner, repo, ref, pathを取得
        const owner = activeRepo.owner.login;
        const repoName = activeRepo.name;
        const ref = activeRepo.default_branch;
        const path = item.path;
        // GitHub APIからファイルデータ取得
        const url = `https://api.github.com/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}?ref=${ref}`;
        const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" }});
        const data = await res.json(); // { type: "file", encoding: "base64", content: "..." }
        let content = "";
        if (data && data.type === "file" && data.encoding === "base64" && typeof data.content === "string") {
          content = atob(data.content);
        } else {
          content = "ファイル内容の取得に失敗しました";
        }
        const fileWithContent: FileOrDir = {
          name: item.name,
          url: item.url,
          type: item.type,
          path: item.path,
          content
        };
        setLoading(false);
        navigate("/openfile", { state: { file: fileWithContent } });
      } catch {
        setLoading(false);
        setError("ファイル内容の取得に失敗しました");
      }
    }
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
