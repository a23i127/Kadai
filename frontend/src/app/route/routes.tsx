import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../App";


const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      
      {/* 追加ページ例: <Route path="/repos/:owner/:repo/*" element={<DisplayArea />} /> */}
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;