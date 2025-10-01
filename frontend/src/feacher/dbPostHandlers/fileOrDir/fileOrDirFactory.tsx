// FileOrDir型とfactory関数

export interface FileOrDir {
  id?: number;
  repo_id: number;
  name: string;
  path: string;
  type: "file" | "dir";
  url?: string;
  html_url?: string;
  download_url?: string;
  sha?: string;
  size?: number;
  content?: string;
  parent?: string;
  fetched_at?: string;
  // _linksなど必要なら追加
}

export function createFileOrDir(data: Partial<FileOrDir>): FileOrDir {
  return {
    id: data.id,
    repo_id: data.repo_id ?? 0,
    name: data.name ?? "",
    path: data.path ?? "",
    type: data.type ?? "file",
    url: data.url,
    html_url: data.html_url,
    download_url: data.download_url,
    sha: data.sha,
    size: data.size,
    content: data.content,
    parent: data.parent,
    fetched_at: data.fetched_at,
    // _linksなど必要なら初期化
  };
}
