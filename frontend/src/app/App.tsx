import "../App.css";

import DisplayArea from "../components/DisplayArea";

function App() {
  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "linear-gradient(135deg, #e0e7ff 0%, #fff 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      
      <DisplayArea />
    </div>
  );
}

export default App;
