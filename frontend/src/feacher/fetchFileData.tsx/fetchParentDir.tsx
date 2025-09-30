import type { Repo } from "./fetchRepo";
import { fetchFileOrDirContentsAction } from "./fetchFileOrDirContents";

export async function fetchParentDir(
  repo: Repo,
  currentPath: string
): Promise<{ name: string; url?: string }[]> {
  // 親ディレクトリのパスを計算
  let parentPath = "";
  if (currentPath.includes("/")) {
    parentPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
  }
  // repo情報と親パスでAPIを叩く
  return await fetchFileOrDirContentsAction(repo, parentPath);
}
