import axios from "axios";
import type { Repo } from "./fetchRepo";

// GitHub APIのレスポンス型（最低限nameだけ持つ）
type FileOrDir = { name: string; url?: string };

export async function fetchFileOrDirContentsAction(
  repo: Repo,
  path: string = ""
): Promise<FileOrDir[]> {
  try {
    const result = await axios.get(
      `http://localhost:3030/api/repos/${repo.owner.login}/${repo.name}/contents/${path}?ref=${encodeURIComponent(repo.default_branch)}`
    );
    let items: FileOrDir[] = [];
    if (Array.isArray(result.data)) {
      items = result.data.map((item: { name: string; html_url?: string }) => ({ name: item.name, url: item.html_url }));
    } else if (result.data && result.data.name) {
      items = [{ name: result.data.name, url: result.data.html_url }];
    }
    return items;
  } catch {
    return [];
  }
}
