const OrganizationButton = () => (
  <div style={{ marginBottom: 60 }}>
    <button style={{
      width: 320,
      height: 64,
      fontSize: 26,
      fontWeight: "bold",
      border: "none",
      borderRadius: 12,
      background: "linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)",
      color: "#fff",
      boxShadow: "0 4px 16px rgba(99,102,241,0.15)",
      cursor: "pointer",
      transition: "transform 0.1s"
    }}
    onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
    onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    >
      組織(ボタン)
    </button>
  </div>
);

export default OrganizationButton;
