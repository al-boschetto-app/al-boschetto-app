import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage";
import MenuPage from "@/pages/MenuPage";
import AssistancePage from "@/pages/AssistancePage";
import AdminPage from "@/pages/AdminPage";
import AdminLoginPage from "@/pages/AdminLoginPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/assistance" element={<AssistancePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
