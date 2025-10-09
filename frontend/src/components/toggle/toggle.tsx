import React from "react";

interface ToggleProps {
  onClick: () => void;
  children?: React.ReactNode;
}

const Toggle: React.FC<ToggleProps> = ({ onClick, children }) => (
  <button
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.5em',
      color: '#facc15',
      transition: 'transform 0.1s',
      padding: 0,
    }}
    aria-label="お気に入りトグル"
    onClick={onClick}
  >
    {children ?? '★'}
  </button>
);

export default Toggle;
