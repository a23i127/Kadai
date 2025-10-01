import axios from "axios";
import type { FileOrDir } from "./fileOrDirFactory";
import { createFileOrDir } from "./fileOrDirFactory";

export async function postFileOrDirBatch(repoId: number, items: FileOrDir[]): Promise<{ error?: string } | FileOrDir[]> {
  // factoryで型保証しつつデータ整形
  const payload = items.map(item => createFileOrDir({ ...item, repo_id: repoId }));
  try {
    const res = await axios.post(
      `/api/file-or-dir/create/batch/${repoId}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return { error: err.response?.data?.error || err.message };
    }
    return { error: String(err) };
  }
}