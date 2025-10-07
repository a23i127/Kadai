import type { Repo } from "../fetchFileData/fetchRepo";
import type { FileOrDir } from "../getCash/getCash";

export const searchRepositories = async (
  repoName: string | null,
  setRepos: (repos: Repo[]) => void,
  setSelectedItems: (items: FileOrDir[]) => void,
  setCurrentPath: (path: string) => void,
  setActiveRepo: (repo: Repo | null) => void,
  setLoading: (loading: boolean) => void,
  setError: (err: string) => void,
  setCacheAlert: (msg: string) => void
) => {
  try {
    setLoading(true);
    setError("");
    setCacheAlert("");
    const params = repoName ? `?repo=${encodeURIComponent(repoName)}` : "";
    const res = await fetch(`/api/orgs/repos${params}`);
    if (!res.ok) throw new Error("APIリクエストに失敗しました");
    const data = await res.json();
    const repos = Array.isArray(data) ? data : [data];
    setRepos(repos);
    setSelectedItems([]);
    setCurrentPath("");
    setActiveRepo(null);
  } catch {
    setError("検索に失敗しました");
  } finally {
    setLoading(false);
  }
};
