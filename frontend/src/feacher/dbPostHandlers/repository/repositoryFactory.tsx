// リポジトリAPI用の型・factory関数

//カラム追加など、保守性上げるためカラム直で書くのやめた

//必要最低限のデータのみを受け取り、データベースに保存するため、Repository型を作った

export interface Repository {
  id?: number;
  name: string;
  full_name: string;
  default_branch?: string;
  owner?: {
    login: string;
    html_url: string;
    type: string;
    avatar_url: string;
  };
  // 必要に応じて他のフィールドも追加
}
//Repository型を受け取り、必須フィールドを保証しつつオブジェクトを生成する
export function createRepository(data: Partial<Repository>): Repository {
  return {
    id: data.id,
    name: data.name ?? "",
    full_name: data.full_name ?? "",
    default_branch: data.default_branch,
    owner: data.owner ?? { login: "", html_url: "", type: "", avatar_url: "" },
    // 他フィールドも必要に応じて初期化
  };
}
