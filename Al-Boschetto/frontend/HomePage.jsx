import { useNavigate } from "react-router-dom";
import { Coffee, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://static.prod-images.emergentagent.com/jobs/34c4f6e2-7a27-43ea-8837-4f365bb1c208/images/84d92a2a4c988717ebc5bd8388d246591f36bdb7af5846d9b004b2a8ed04314e.png";
const HERO_URL = "https://static.prod-images.emergentagent.com/jobs/34c4f6e2-7a27-43ea-8837-4f365bb1c208/images/dee118b8ed10d14249cc91ea83f6f305032c06ea1eda76bcdcac218cb2000946.png";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="mobile-container bg-brand-cream relative overflow-hidden">
      <div className="relative h-[55vh] overflow-hidden">
        <img
          src={HERO_URL}
          alt="Al Boschetto breakfast"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-cream via-brand-cream/30 to-transparent" />
        
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <img
            src={LOGO_URL}
            alt="Al Boschetto"
            className="w-28 h-28 rounded-full shadow-soft bg-white/90 p-2"
            data-testid="logo"
          />
        </div>
      </div>

      <div className="relative px-6 pb-12 -mt-20 z-10">
        <div className="text-center mb-10 animate-fade-in">
          <h1 
            className="font-serif text-4xl md:text-5xl font-semibold text-stone-800 mb-3 tracking-tight"
            data-testid="welcome-title"
          >
            Benvenuto
          </h1>
          <p className="text-stone-600 text-lg font-sans">
            Rendi il tuo risveglio speciale
          </p>
        </div>

        <div className="space-y-4 animate-slide-up">
          <Button
            data-testid="order-breakfast-button"
            onClick={() => navigate("/menu")}
            className="w-full h-16 bg-brand-green hover:bg-brand-green-hover text-white rounded-full text-lg font-medium shadow-soft flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <Coffee className="w-6 h-6" />
            Ordina Colazione
          </Button>

          <Button
            data-testid="request-assistance-button"
            onClick={() => navigate("/assistance")}
            variant="outline"
            className="w-full h-16 bg-white hover:bg-stone-50 text-brand-wood border-2 border-brand-wood/20 rounded-full text-lg font-medium shadow-soft flex items-center justify-center gap-3 transition-all duration-300 hover:border-brand-wood/40 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-6 h-6" />
            Richiedi Assistenza
          </Button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-stone-400 text-sm font-sans">
            B&B Al Boschetto
          </p>
        </div>
      </div>
    </div>
  );
}
