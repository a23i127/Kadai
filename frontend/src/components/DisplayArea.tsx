import { useState } from "react";
import "./Display.css";
import { fetchReposWithState } from "../feacher/fetchFileData.tsx/fetchRepo";
import { fetchFileOrDirContentsAction } from "../feacher/fetchFileData.tsx/fetchFileOrDirContents";
import type { Repo } from "../feacher/fetchFileData.tsx/fetchRepo";

const DisplayArea = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRepoNames, setSelectedRepoNames] = useState<string[]>([]);

  const handleClick = () => {
    fetchReposWithState(setRepos, setLoading, setError);
  };

  const handleRepoClick = async (repo: Repo) => {
    setLoading(true);
    setError("");
    try {
      const items = await fetchFileOrDirContentsAction(repo);
      setSelectedRepoNames(items.map(item => item.name)); // nameだけ抽出
    } catch {
      setError("ファイル/ディレクトリ取得に失敗しました");
      setSelectedRepoNames([]);
    }
    setLoading(false);
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
          {selectedRepoNames.length > 0
            ? selectedRepoNames.map((name, idx) => (
                <li key={idx} className="repo-list-item">{name}</li>
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
