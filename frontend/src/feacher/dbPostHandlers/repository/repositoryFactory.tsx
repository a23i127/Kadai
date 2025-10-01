// リポジトリAPI用の型・factory関数

//カラム追加など、保守性上げるためカラム直で書くのやめた
export interface Repository {
  id?: number;
  name: string;
  full_name: string;
  default_branch?: string;
  // 必要に応じて他のフィールドも追加
}

export function createRepository(data: Partial<Repository>): Repository {
  return {
    id: data.id,
    name: data.name ?? "",
    full_name: data.full_name ?? "",
    default_branch: data.default_branch,
    // 他フィールドも必要に応じて初期化
  };
}
