import { useState, useCallback } from "react";
import { fetchGoogleReposWithCache } from "../handleSerect/handleGetRepo/fetchGoogleRepos";
import type { Repo } from "../handleSerect/handleGetRepo/fetchRepo";

interface UseLoadMoreReposProps {
  setRepos: (repos: Repo[] | ((prev: Repo[]) => Repo[])) => void;
}

export const useLoadMoreRepos = ({ setRepos }: UseLoadMoreReposProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // 初回読み込み
  const loadInitialRepos = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    setRepos([]);
    setCurrentPage(1);
    setHasMore(true);

    try {
      const { repos: newRepos, hasNext } = await fetchGoogleReposWithCache(1, 10);
      
      setRepos(newRepos);
      setCurrentPage(2);
      setHasMore(hasNext);
    } catch {
      setFetchError("リポジトリの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [setRepos]);

  // 追加読み込み
  const loadMoreRepos = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    setFetchError("");

    try {
      const { repos: newRepos, hasNext } = await fetchGoogleReposWithCache(currentPage, 10);
      
      // 空データの場合は強制終了
      if (newRepos.length === 0) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }
      
      setRepos(prev => [...prev, ...newRepos]);
      setCurrentPage(prev => prev + 1);
      setHasMore(hasNext);
    } catch {
      setFetchError("追加リポジトリの取得に失敗しました");
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isLoading, hasMore, setRepos]);

  return {
    isLoading,
    fetchError,
    hasMore,
    loadInitialRepos,
    loadMoreRepos,
    resetRepos: () => {
      setRepos([]);
      setCurrentPage(1);
      setHasMore(true);
      setFetchError("");
    }
  };
};
