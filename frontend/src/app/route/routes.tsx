import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../App";
import OpenFile from "../OpenFile";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/openfile" element={<OpenFile />} />
      {/* 追加ページ例: <Route path="/repos/:owner/:repo/*" element={<DisplayArea />} /> */}
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;