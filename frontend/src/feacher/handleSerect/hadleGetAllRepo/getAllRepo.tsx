import { fetchReposWithCache } from "../../getCash/getCash";
import type { Repo } from "../../fetchFileData/fetchRepo";
import type { FileOrDir } from "../../getCash/getCash";

// 全リポジトリ取得＆DB保存用関数
export const handleFetchAllRepos = async (
  setRepos: (repos: Repo[]) => void,
  setSelectedItems: (items: FileOrDir[]) => void,
  setCurrentPath: (path: string) => void,
  setActiveRepo: (repo: Repo | null) => void,
  setLoading: (loading: boolean) => void,
  setError: (err: string) => void
) => {
  await fetchReposWithCache(
    (newRepos: Repo[]) => {
      setRepos(newRepos);
      setSelectedItems([]);
      setCurrentPath("");
      setActiveRepo(null);
      console.log("Repos fetched:", newRepos);
     
    },
    setLoading,
    setError
  );
};
