import React from "react";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importiamo i componenti direttamente dalla cartella src dove si trovano ora
import HomePage from "./HomePage";
import MenuPage from "./MenuPage";
import AssistancePage from "./AssistancePage";
import AdminPage from "./AdminPage";
import AdminLoginPage from "./AdminLoginPage";

// Se hai installato la libreria 'sonner' per i messaggi di conferma (Toaster), 
// queste righe funzioneranno. Se danno errore, metti // davanti per disattivarle.
import { Toaster } from "sonner"; 

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
      {/* Il Toaster mostra i messaggi di successo/errore */}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
