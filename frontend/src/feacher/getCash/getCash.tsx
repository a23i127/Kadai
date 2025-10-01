import axios from "axios";
import type { Repo } from "../fetchFileData/fetchRepo";

export interface FileOrDir {
  name: string;
  url?: string;
  type?: "file" | "dir";
  path?: string;
  content?: string;
  fromCache?: boolean;
}

export const fetchFileOrDirWithCache = async (
  repoId: number,
  path: string,
  fetchFromApi: () => Promise<FileOrDir[]>
) => {
  // "core/pom.xml" -> ["core","pom.xml"] -> ["core","pom.xml"](各segmentをencode) -> "core/pom.xml"
  const encodedPath = path
    ? path.split("/").map(encodeURIComponent).join("/")
    : "";

  try {
    const res = await axios.get(`/api/db/fileordir/${repoId}/${encodedPath}`);
    if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
      // DBヒット
      return res.data.map((item: FileOrDir) => ({
        name: item.name,
        url: item.url,
        type: item.type,
        path: item.path,
        content: item.content,
        fromCache: true
      }));
    }
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.debug("DB取得失敗/キャッシュミス", e.response?.status);
    } else {
      console.debug("DB取得失敗/キャッシュミス", e);
    }
    // 失敗時はAPIにフォールバック
  }

  // フォールバック：GitHub API などから取得
  const apiItems = await fetchFromApi();
  return apiItems.map(item => ({ ...item, fromCache: false }));
};

export const fetchReposWithCache = async (setRepos: (repos: Repo[]) => void, setLoading: (loading: boolean) => void, setError: (err: string) => void) => {
  setLoading(true);
  setError("");
  try {
    // まずDBキャッシュから取得
    const dbRes = await axios.get("/api/db/repos");
    if (dbRes.data && Array.isArray(dbRes.data) && dbRes.data.length > 0) {
      setRepos(dbRes.data);
      setLoading(false);
      return;
    }
    // キャッシュがなければAPIから取得
    const apiRes = await axios.get("/api/orgs/repos");
    if (apiRes.data && Array.isArray(apiRes.data)) {
      setRepos(apiRes.data);
    }
  } catch {
    setError("リポジトリ取得に失敗しました");
  }
  setLoading(false);
};