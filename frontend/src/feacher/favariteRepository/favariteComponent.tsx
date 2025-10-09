import type { Repo } from "../fetchFileData/fetchRepo";

//似ている処理がsearch/Repository/showRepoNameCandidate.tsxにもあるが、dbに対してapiを叩く部分が違うため、別ファイルにしている

// Repo[]を受け取り、モーダルUIでリスト表示する関数
export const showFavoriteReposModal = async (repos: Repo[]): Promise<Repo | null> => {
  if (!repos || repos.length === 0) {
    alert("お気に入りリポジトリはありません");
    return null;
  }
  return await new Promise<Repo | null>(resolve => {
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.25)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";
    modal.innerHTML = `
      <div style="background:#fff;padding:32px 28px 24px 28px;border-radius:12px;min-width:320px;box-shadow:0 4px 24px rgba(99,102,241,0.10);display:flex;flex-direction:column;align-items:center;">
        <div style="font-weight:bold;font-size:1.1em;margin-bottom:12px;">お気に入りリポジトリ一覧</div>
        <div id="favorite-repo-list" style="max-height:220px;overflow-y:auto;width:100%;margin-bottom:16px;"></div>
        <div style="display:flex;gap:12px;width:100%;justify-content:flex-end;">
          <button id="favorite-repo-cancel" style="background:#eee;color:#333;font-weight:bold;padding:8px 24px;border:none;border-radius:6px;cursor:pointer;">閉じる</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const list = modal.querySelector("#favorite-repo-list") as HTMLDivElement;
    const cancelBtn = modal.querySelector("#favorite-repo-cancel") as HTMLButtonElement;
    list.innerHTML = repos.map((repo, i) =>
      `<button type="button" style="display:block;width:100%;text-align:left;padding:8px 12px;margin-bottom:4px;background:linear-gradient(90deg,#6366f1 0%,#60a5fa 100%);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:1em;font-weight:bold;" class="favorite-repo-btn" data-idx="${i}">${repo.name}</button>`
    ).join("");
    list.querySelectorAll(".favorite-repo-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = Number((btn as HTMLButtonElement).dataset.idx);
        document.body.removeChild(modal);
        // handleRepoSelectは呼び出し元で使うため、ここではresolveのみ
        resolve(repos[idx]);
      });
    });
    cancelBtn.onclick = () => {
      document.body.removeChild(modal);
      resolve(null);
    };
  });
};
