import axios from "axios";

export type Repo = {
  id: number;
  name: string;
  full_name: string;
  default_branch: string;
  description: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  topics: string[];
  license?: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
  };
  created_at: string;
  updated_at: string;
  pushed_at: string;
  owner: {
    login: string;
    html_url: string;
    type: string;
    avatar_url: string;
  };
  tag?: string; // タグ付け機能用のフィールド
  fromCache?: boolean; // キャッシュから取得されたかどうかを示すフィールド
};  

export async function fetchReposWithState(setRepos: (repos: Repo[]) => void, setLoading: (loading: boolean) => void, setError: (err: string) => void) {
  setLoading(true);
  setError("");
  try {
    const res = await axios.get<Repo[]>("http://localhost:3030/api/orgs/repos");
    setRepos(res.data);
  } catch {
    setError("取得に失敗しました");
  }
  setLoading(false);
}