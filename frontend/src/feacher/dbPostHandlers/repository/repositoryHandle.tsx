import axios from "axios";
import type { Repo } from "../../fetchFileData/fetchRepo";
import { createRepository } from "./repositoryFactory";

export async function postRepositoriesBatch(items: Repo[]): Promise<{ error?: string } | Repo[]> {
  // factoryで型保証しつつデータ整形
  const payload = items.map(item => createRepository(item));
  try {
    const res = await axios.post(
      "/api/repository/create/batch",
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