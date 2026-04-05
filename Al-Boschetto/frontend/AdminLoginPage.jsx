import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LOGO_URL = "https://static.prod-images.emergentagent.com/jobs/34c4f6e2-7a27-43ea-8837-4f365bb1c208/images/84d92a2a4c988717ebc5bd8388d246591f36bdb7af5846d9b004b2a8ed04314e.png";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error("Inserisci username e password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, {
        username: username.trim(),
        password: password.trim()
      });

      if (response.data.success) {
        localStorage.setItem("adminToken", response.data.token);
        toast.success("Accesso effettuato!");
        navigate("/admin");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Credenziali non valide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container bg-brand-cream min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <img
            src={LOGO_URL}
            alt="Al Boschetto"
            className="w-24 h-24 mx-auto rounded-full shadow-soft bg-white/90 p-2 mb-4"
          />
          <h1 className="font-serif text-3xl font-semibold text-stone-800">
            Area Riservata
          </h1>
          <p className="text-stone-500 mt-2">
            Accedi al pannello di gestione
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <Input
              data-testid="username-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-14 pl-12 rounded-2xl border-stone-200 bg-white focus:border-brand-green focus:ring-brand-green"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <Input
              data-testid="password-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 pl-12 rounded-2xl border-stone-200 bg-white focus:border-brand-green focus:ring-brand-green"
            />
          </div>

          <Button
            data-testid="login-button"
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-brand-green hover:bg-brand-green-hover text-white rounded-full text-lg font-medium shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all duration-300 mt-6"
          >
            <LogIn className="w-5 h-5" />
            {loading ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            data-testid="back-to-home"
            onClick={() => navigate("/")}
            className="text-stone-500 hover:text-stone-700 text-sm underline"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    </div>
  );
}
