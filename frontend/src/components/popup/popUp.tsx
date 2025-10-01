import React from "react";
import "./popUp.css";

interface PopUpProps {
  file?: {
    name: string;
    path?: string;
    content?: string;
  };
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ file, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-modal" tabIndex={-1}>
        <button
          className="popup-close-btn"
          onClick={onClose}
          aria-label="閉じる"
          title="閉じる"
        >
          × 閉じる
        </button>
        <h2 className="popup-title">ファイル表示</h2>
        {file ? (
          <div>
            <div className="popup-filename">ファイル名: {file.name}</div>
            <div className="popup-path">パス: {file.path}</div>
            <div className="popup-content-zone" style={{ maxHeight: 400, overflowY: 'auto' }}>
              <pre className="popup-content-text">{file.content}</pre>
            </div>
          </div>
        ) : (
          <div>ファイル情報がありません</div>
        )}
      </div>
    </div>
  );
};

export default PopUp;
