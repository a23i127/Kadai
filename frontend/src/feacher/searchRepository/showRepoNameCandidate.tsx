// DBからリポジトリ名候補を取得して表示する関数（UI付き）
export const showRepoNameCandidates = async (): Promise<string | null> => {
  try {
    let shouldShowModal = true;
    const repoName = await new Promise<string | null>(resolve => {
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
          <div style="font-weight:bold;font-size:1.1em;margin-bottom:12px;">検索したいリポジトリ名を入力してください</div>
          <input id="repo-search-input" style="width:90%;padding:8px 12px;font-size:1em;border-radius:6px;border:1px solid #ccc;margin-bottom:16px;" placeholder="リポジトリ名を入力" />
          <div id="repo-candidate-list" style="max-height:180px;overflow-y:auto;width:100%;margin-bottom:16px;"></div>
          <div style="display:flex;gap:12px;width:100%;justify-content:flex-end;">
            <button id="repo-search-ok" style="background:#6366f1;color:#fff;font-weight:bold;padding:8px 24px;border:none;border-radius:6px;cursor:pointer;">OK</button>
            <button id="repo-search-cancel" style="background:#eee;color:#333;font-weight:bold;padding:8px 24px;border:none;border-radius:6px;cursor:pointer;">キャンセル</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      const input = modal.querySelector("#repo-search-input") as HTMLInputElement;
      const okBtn = modal.querySelector("#repo-search-ok") as HTMLButtonElement;
      const cancelBtn = modal.querySelector("#repo-search-cancel") as HTMLButtonElement;
      const candidateList = modal.querySelector("#repo-candidate-list") as HTMLDivElement;
      okBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve(input.value);
      };
      cancelBtn.onclick = () => {
        document.body.removeChild(modal);
        shouldShowModal = false;
        resolve(null);
      };
      input.focus();
      input.onkeydown = e => {
        if (e.key === "Enter") {
          okBtn.click();
        }
      };
      // fetchはキャンセルされなかった場合のみ呼ぶ
      setTimeout(async () => {
        if (!shouldShowModal) return;
        try {
          const res = await fetch("/api/db/repos");
          if (!res.ok) return;
          const data = await res.json();
          if (!Array.isArray(data) || data.length === 0) return;
          candidateList.innerHTML = data.map((repo: { name: string }) => `<button type="button" style="display:block;width:100%;text-align:left;padding:8px 12px;margin-bottom:4px;background:linear-gradient(90deg,#6366f1 0%,#60a5fa 100%);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:1em;font-weight:bold;" class="repo-candidate-btn">${repo.name}</button>`).join("");
          candidateList.querySelectorAll(".repo-candidate-btn").forEach(btn => {
            btn.addEventListener("click", () => {
              input.value = (btn as HTMLButtonElement).textContent || "";
            });
          });
        } catch {
          // fetch失敗時は何もしない
        }
      }, 0);
    });
    return repoName;
  } catch {
    // 失敗時は通常のprompt
    return window.prompt("検索したいリポジトリ名を入力してください（空欄で全件取得）", "");
  }
};