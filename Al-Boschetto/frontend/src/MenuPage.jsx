import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingBag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DELIVERY_TIMES = [
  "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30"
];

const CATEGORIES = ["Dolce", "Bevande", "Altro"];

export default function MenuPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState("Dolce");
  const [roomNumber, setRoomNumber] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      await axios.post(`${API}/seed`);
      const response = await axios.get(`${API}/products/available`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Errore nel caricamento dei prodotti");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const newQty = Math.max(0, current + delta);
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleSubmitOrder = async () => {
    if (!roomNumber.trim()) {
      toast.error("Inserisci il numero della camera");
      return;
    }
    if (!deliveryTime) {
      toast.error("Seleziona l'orario di consegna");
      return;
    }
    if (getCartTotal() === 0) {
      toast.error("Il carrello è vuoto");
      return;
    }

    setSubmitting(true);
    try {
      const items = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          product_id: productId,
          product_name: product?.name || "Prodotto",
          quantity
        };
      });

      await axios.post(`${API}/orders`, {
        room_number: roomNumber.trim(),
        items,
        delivery_time: deliveryTime
      });

      toast.success("Ordine inviato con successo!");
      setCart({});
      setRoomNumber("");
      setDeliveryTime("");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Errore nell'invio dell'ordine");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => p.category === activeCategory);

  if (loading) {
    return (
      <div className="mobile-container bg-brand-cream flex items-center justify-center">
        <div className="animate-pulse-soft text-brand-green text-lg">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-brand-cream pb-56">
      <div className="sticky top-0 z-20 bg-brand-cream/95 backdrop-blur-sm px-4 py-4 border-b border-stone-200/50">
        <div className="flex items-center gap-4">
          <Button
            data-testid="back-button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full hover:bg-stone-200/50"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </Button>
          <h1 className="font-serif text-2xl font-semibold text-stone-800">
            Menu Colazione
          </h1>
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">
          {CATEGORIES.map(category => (
            <button
              key={category}
              data-testid={`category-${category.toLowerCase()}`}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeCategory === category
                  ? "bg-brand-green text-white shadow-md"
                  : "bg-white text-stone-600 hover:bg-stone-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            data-testid={`product-card-${product.id}`}
            className="product-card bg-white rounded-3xl shadow-soft p-3 flex gap-4 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-stone-800 text-base truncate">
                {product.name}
              </h3>
              <p className="text-stone-500 text-sm mt-0.5 line-clamp-2">
                {product.description}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                data-testid={`decrease-${product.id}`}
                onClick={() => updateQuantity(product.id, -1)}
                className="qty-btn w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                disabled={!cart[product.id]}
              >
                <Minus className="w-4 h-4 text-stone-600" />
              </button>
              <span 
                data-testid={`quantity-${product.id}`}
                className="w-6 text-center font-medium text-stone-800"
              >
                {cart[product.id] || 0}
              </span>
              <button
                data-testid={`increase-${product.id}`}
                onClick={() => updateQuantity(product.id, 1)}
                className="qty-btn w-9 h-9 rounded-full bg-brand-green hover:bg-brand-green-hover flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="max-w-md mx-auto glass checkout-bar rounded-t-3xl p-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                data-testid="room-number-input"
                type="text"
                placeholder="N° Camera"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="h-12 rounded-2xl border-stone-200 bg-white text-center font-medium focus:border-brand-green focus:ring-brand-green"
              />
            </div>
            <div className="flex-1">
              <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                <SelectTrigger 
                  data-testid="delivery-time-select"
                  className="h-12 rounded-2xl border-stone-200 bg-white focus:border-brand-green focus:ring-brand-green"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <SelectValue placeholder="Orario" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_TIMES.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            data-testid="submit-order-button"
            onClick={handleSubmitOrder}
            disabled={submitting || getCartTotal() === 0}
            className="w-full h-14 bg-brand-green hover:bg-brand-green-hover text-white rounded-full text-lg font-medium shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ShoppingBag className="w-5 h-5" />
            {submitting ? "Invio in corso..." : `Invia Ordine (${getCartTotal()} articoli)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
