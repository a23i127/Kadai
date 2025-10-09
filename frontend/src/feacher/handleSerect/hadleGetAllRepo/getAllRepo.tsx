import { fetchReposWithCache } from "../../getCash/getCash";
import { postRepositoriesBatch } from "../../dbPostHandlers/repository/repositoryHandle";
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
      // 取得できたらまとめてDB保存
      if (newRepos.length > 0) {
        postRepositoriesBatch(newRepos);
      }
    },
    setLoading,
    setError
  );
};
