// DBからリポジトリ名候補を取得して表示する関数
export const showRepoNameCandidates = async (): Promise<string | null> => {
  try {
    const res = await fetch("/api/db/repos");
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    // 候補リストを作成
    const names = data.map((repo: { name: string }) => repo.name).join("\n");
    return window.prompt(`検索したいリポジトリ名を入力してください（空欄で全件取得）\n---\n候補:\n${names}`) ?? "";
  } catch {
    // 失敗時は通常のprompt
    return window.prompt("検索したいリポジトリ名を入力してください（空欄で全件取得）", "");
  }
};