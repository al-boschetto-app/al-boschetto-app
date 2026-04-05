import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, Bell, Package, MessageSquare, Check, Clock, 
  ChefHat, RefreshCw, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState({ new_orders: 0, new_messages: 0 });
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, messagesRes, productsRes, notifRes] = await Promise.all([
        axios.get(`${API}/orders`),
        axios.get(`${API}/messages`),
        axios.get(`${API}/products`),
        axios.get(`${API}/notifications/count`)
      ]);
      setOrders(ordersRes.data);
      setMessages(messagesRes.data);
      setProducts(productsRes.data);
      setNotifications(notifRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status`, { status });
      toast.success(`Ordine ${status === "Consegnato" ? "consegnato" : "aggiornato"}!`);
      fetchData();
    } catch (error) {
      toast.error("Errore nell'aggiornamento");
    }
  };

  const updateMessageStatus = async (messageId, status) => {
    try {
      await axios.patch(`${API}/messages/${messageId}/status`, { status });
      toast.success("Messaggio aggiornato!");
      fetchData();
    } catch (error) {
      toast.error("Errore nell'aggiornamento");
    }
  };

  const toggleProductAvailability = async (productId, currentAvailable) => {
    try {
      await axios.patch(`${API}/products/${productId}`, { 
        available: !currentAvailable 
      });
      toast.success(`Prodotto ${!currentAvailable ? "attivato" : "disattivato"}`);
      fetchData();
    } catch (error) {
      toast.error("Errore nell'aggiornamento");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      "Ricevuto": "bg-amber-100 text-amber-800 border-amber-200",
      "In Preparazione": "bg-blue-100 text-blue-800 border-blue-200",
      "Consegnato": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "In attesa": "bg-amber-100 text-amber-800 border-amber-200",
      "Letto": "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("it-IT", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("it-IT", { 
      day: "2-digit", 
      month: "short"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-pulse-soft text-brand-green text-lg">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-20 bg-white border-b border-stone-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl font-semibold text-stone-800">
              Dashboard
            </h1>
            {(notifications.new_orders > 0 || notifications.new_messages > 0) && (
              <div className="flex items-center gap-1">
                <Bell className="w-4 h-4 text-amber-500 animate-pulse-soft" />
                <span className="text-xs font-medium text-amber-600">
                  {notifications.new_orders + notifications.new_messages} nuovi
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              data-testid="refresh-button"
              variant="ghost"
              size="icon"
              onClick={fetchData}
              className="rounded-full"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              data-testid="home-button"
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <Home className="w-4 h-4" />
            </Button>
            <Button
              data-testid="logout-button"
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6 bg-white rounded-2xl p-1 shadow-soft">
            <TabsTrigger 
              data-testid="tab-orders"
              value="orders" 
              className="rounded-xl data-[state=active]:bg-brand-green data-[state=active]:text-white"
            >
              <Package className="w-4 h-4 mr-2" />
              Ordini
              {notifications.new_orders > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {notifications.new_orders}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              data-testid="tab-messages"
              value="messages"
              className="rounded-xl data-[state=active]:bg-brand-green data-[state=active]:text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Richieste
              {notifications.new_messages > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {notifications.new_messages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              data-testid="tab-inventory"
              value="inventory"
              className="rounded-xl data-[state=active]:bg-brand-green data-[state=active]:text-white"
            >
              <ChefHat className="w-4 h-4 mr-2" />
              Magazzino
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                Nessun ordine presente
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  data-testid={`order-card-${order.id}`}
                  className={`bg-white rounded-2xl p-4 shadow-soft ${
                    !order.read ? "ring-2 ring-amber-400" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-2xl font-bold text-stone-800">
                          Camera {order.room_number}
                        </span>
                        {!order.read && (
                          <Badge className="bg-amber-500 text-white text-xs">Nuovo</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-stone-500">
                        <Clock className="w-3 h-3" />
                        <span>Consegna: {order.delivery_time}</span>
                        <span>•</span>
                        <span>{formatDate(order.timestamp)} {formatTime(order.timestamp)}</span>
                      </div>
                    </div>
                    <Badge className={`${getStatusBadge(order.status)} border`}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-3 mb-3">
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span className="text-stone-700">{item.product_name}</span>
                          <span className="text-stone-500">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.status !== "Consegnato" && (
                    <div className="flex gap-2">
                      {order.status === "Ricevuto" && (
                        <Button
                          data-testid={`prepare-order-${order.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "In Preparazione")}
                          className="flex-1 rounded-xl"
                        >
                          <ChefHat className="w-4 h-4 mr-2" />
                          In Preparazione
                        </Button>
                      )}
                      <Button
                        data-testid={`deliver-order-${order.id}`}
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, "Consegnato")}
                        className="flex-1 rounded-xl bg-brand-green hover:bg-brand-green-hover"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Consegnato
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                Nessuna richiesta presente
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  data-testid={`message-card-${message.id}`}
                  className={`bg-white rounded-2xl p-4 shadow-soft ${
                    message.status === "In attesa" ? "ring-2 ring-amber-400" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-xl font-bold text-stone-800">
                          Camera {message.room_number}
                        </span>
                        <Badge variant="secondary" className="bg-brand-wood/10 text-brand-wood">
                          {message.request_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-stone-500 mt-1">
                        {formatDate(message.timestamp)} {formatTime(message.timestamp)}
                      </div>
                    </div>
                    <Badge className={`${getStatusBadge(message.status)} border`}>
                      {message.status}
                    </Badge>
                  </div>

                  <p className="text-stone-600 bg-stone-50 rounded-xl p-3 mb-3">
                    {message.message}
                  </p>

                  {message.status === "In attesa" && (
                    <Button
                      data-testid={`mark-read-${message.id}`}
                      size="sm"
                      onClick={() => updateMessageStatus(message.id, "Letto")}
                      className="rounded-xl bg-brand-green hover:bg-brand-green-hover"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Segna come Letto
                    </Button>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-2">
            {["Dolce", "Bevande", "Altro"].map(category => (
              <div key={category} className="mb-4">
                <h3 className="font-serif text-lg font-semibold text-stone-700 mb-2 px-1">
                  {category}
                </h3>
                <div className="space-y-2">
                  {products
                    .filter(p => p.category === category)
                    .map(product => (
                      <div
                        key={product.id}
                        data-testid={`inventory-item-${product.id}`}
                        className="bg-white rounded-xl p-3 shadow-soft flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-medium text-stone-800">{product.name}</span>
                            <p className="text-xs text-stone-500">{product.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${product.available ? "text-emerald-600" : "text-red-500"}`}>
                            {product.available ? "Disponibile" : "Esaurito"}
                          </span>
                          <Switch
                            data-testid={`toggle-${product.id}`}
                            checked={product.available}
                            onCheckedChange={() => toggleProductAvailability(product.id, product.available)}
                            className="data-[state=checked]:bg-brand-green"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
