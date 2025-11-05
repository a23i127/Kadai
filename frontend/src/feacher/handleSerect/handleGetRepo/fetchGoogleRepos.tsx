import type { Repo } from "./fetchRepo";
import axios from "axios";

// キャッシュとAPIを組み合わせたGoogle組織リポジトリ取得関数
export const fetchGoogleReposWithCache = async (page: number = 1, limit: number = 10) => {
  try {
    // まずDBキャッシュから全件取得
    const dbRes = await axios.get("/api/db/repos");
    const cachedRepos: Repo[] = dbRes.data && Array.isArray(dbRes.data) ? dbRes.data : [];
    
    // ページネーション計算
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // キャッシュで十分な場合でも、APIに更に多くのデータがある可能性を考慮
    if (cachedRepos.length >= endIndex) {
      const pageRepos = cachedRepos.slice(startIndex, endIndex);
      
      // APIから総数情報を取得して、実際にまだデータがあるかチェック
      let hasNext = cachedRepos.length > endIndex; // まずキャッシュ内での判定
      
      // キャッシュの末尾に達した場合は、APIに追加データがあるかチェック
      if (!hasNext && endIndex >= cachedRepos.length) {
        try {
          // APIから次のページがあるかチェック（軽量なリクエスト）
          const nextPage = Math.ceil(cachedRepos.length / limit) + 1;
          const checkResponse = await fetch(`/api/orgs/repos?page=${nextPage}&limit=1`);
          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            hasNext = Array.isArray(checkData) && checkData.length > 0;
          }
        } catch {
          // エラーの場合は保守的にtrueとする
          hasNext = true;
        }
      }
      
      return {
        repos: pageRepos,
        linkHeader: null,
        hasNext,
        totalCached: cachedRepos.length
      };
    }
    
    // キャッシュが不足している場合、APIから取得
    const apiResponse = await fetch(`/api/orgs/repos?page=${page}&limit=${limit}`);
    
    if (!apiResponse.ok) {
      throw new Error(`HTTP error! status: ${apiResponse.status}`);
    }
    
    const apiRepos = await apiResponse.json();
    const linkHeader = apiResponse.headers.get('Link');
    
    // キャッシュからページ分を取得
    const cachedPageRepos = cachedRepos.slice(startIndex, Math.min(endIndex, cachedRepos.length));
    
    // APIから取得したデータをそのまま使用（APIはすでに適切なページを返している）
    const neededFromApi = limit - cachedPageRepos.length;
    const apiPageRepos = neededFromApi > 0 ? apiRepos.slice(0, neededFromApi) : [];
    
    // 結果をマージ
    const mergedRepos = [
      ...cachedPageRepos,
      ...apiPageRepos
    ];
    
    // hasNextの判定を修正
    const hasNextFromApi = hasNextPage(linkHeader);
    const hasNextFromCache = cachedRepos.length > endIndex;
    
    // APIからデータを取得しようとした場合は、Linkヘッダーの判定を優先
    // キャッシュのみの場合は、キャッシュ内の残りデータを確認
    const hasNext = hasNextFromApi || hasNextFromCache;
    
    return {
      repos: mergedRepos,
      linkHeader,
      hasNext,
      totalCached: cachedRepos.length
    };
    
  } catch {
    // フォールバック：通常のAPI取得
    const fallbackResult = await fetchGoogleReposWithHeaders(page, limit);
    return {
      ...fallbackResult,
      repos: fallbackResult.repos,
      totalCached: 0
    };
  }
};

// Google組織のリポジトリを取得する関数（レスポンスヘッダー付き）
export const fetchGoogleReposWithHeaders = async (page: number = 1, limit: number = 10) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await fetch(`/api/orgs/repos?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const linkHeader = response.headers.get('Link');
    
    return {
      repos: data,
      linkHeader,
      hasNext: hasNextPage(linkHeader),
      totalCached: 0
    };
  } catch (error) {
    throw error;
  }
};

// Google組織のリポジトリを取得する関数（従来互換）
export const fetchGoogleRepos = async (page: number = 1, limit: number = 10): Promise<Repo[]> => {
  const { repos } = await fetchGoogleReposWithHeaders(page, limit);
  return repos;
};

// Linkヘッダーから次のページがあるかチェック
export const hasNextPage = (linkHeader: string | null): boolean => {
  if (!linkHeader) return false;
  return linkHeader.includes('rel="next"');
};
