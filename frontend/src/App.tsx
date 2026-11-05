import { Routes, Route } from "react-router-dom";
import Game from "@/pages/Game";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Game />} />
      <Route path="*" element={<Game />} />
    </Routes>
  );
}
