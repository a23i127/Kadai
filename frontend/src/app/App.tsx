import "../App.css";
import OrganizationButton from "../components/OrganizationButton";
import DisplayArea from "../components/DisplayArea";

function App() {
  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "linear-gradient(135deg, #e0e7ff 0%, #fff 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <OrganizationButton />
      <DisplayArea />
    </div>
  );
}

export default App;
