import { useLocation, useNavigate } from "react-router-dom";

const OpenFile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const file = location.state?.file;
    console.log("OpenFile received file:", file);
  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h2>OpenFileページ</h2>
      {file ? (
        <div>
          <div>ファイル名: {file.name}</div>
          <div>パス: {file.path}</div>
          <div style={{ marginTop: 24, textAlign: "left", background: "#222", color: "#39ff14", padding: 16, borderRadius: 8, maxWidth: 800, margin: "24px auto", overflowX: "auto" }}>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", color: "#39ff14" }}>{file.content}</pre>
          </div>
          <button style={{ marginTop: 32, padding: "8px 24px", background: "#eee", color: "#222", borderRadius: 6, border: "none", cursor: "pointer" }} onClick={() => navigate(-1)}>
            戻る
          </button>
        </div>
      ) : (
        <div>ファイル情報がありません</div>
      )}
    </div>
  );
};

export default OpenFile;
