export type ItemView = {
  name: string;
  path: string;
  isDir: boolean;
  href?: string;
};

type GitHubApiItem = {
  name: string;
  path: string;
  type: string;
  download_url?: string;
  html_url?: string;
};

export const normalize = (apiItems: unknown[]): ItemView[] =>
  (apiItems as GitHubApiItem[]).map((it) => ({
    name: it.name,
    path: it.path,
    isDir: it.type === "dir",
    href: it.type === "file" ? (it.download_url || it.html_url) : undefined,
  }));