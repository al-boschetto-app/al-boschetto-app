import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Droplets, Wifi, Sparkles, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUICK_REQUESTS = [
  { id: "asciugamani", label: "Asciugamani", icon: Droplets },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "pulizie", label: "Pulizie", icon: Sparkles },
];

export default function AssistancePage() {
  const navigate = useNavigate();
  const [roomNumber, setRoomNumber] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!roomNumber.trim()) {
      toast.error("Inserisci il numero della camera");
      return;
    }
    if (!selectedType) {
      toast.error("Seleziona un tipo di richiesta");
      return;
    }

    setSubmitting(true);
    try {
      const requestType = QUICK_REQUESTS.find(r => r.id === selectedType)?.label || "Altro";
      
      await axios.post(`${API}/messages`, {
        room_number: roomNumber.trim(),
        request_type: requestType,
        message: notes.trim() || `Richiesta ${requestType}`
      });

      toast.success("Richiesta inviata con successo!");
      setRoomNumber("");
      setSelectedType("");
      setNotes("");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Errore nell'invio della richiesta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mobile-container bg-brand-cream min-h-screen">
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
            Richiedi Assistenza
          </h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="animate-fade-in">
          <label className="block text-sm font-medium text-stone-600 mb-2">
            Numero Camera
          </label>
          <Input
            data-testid="room-number-input"
            type="text"
            placeholder="Es. 101"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="h-14 rounded-2xl border-stone-200 bg-white text-lg text-center font-medium focus:border-brand-green focus:ring-brand-green"
          />
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <label className="block text-sm font-medium text-stone-600 mb-3">
            Tipo di Richiesta
          </label>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_REQUESTS.map((request) => {
              const Icon = request.icon;
              const isSelected = selectedType === request.id;
              return (
                <button
                  key={request.id}
                  data-testid={`request-type-${request.id}`}
                  onClick={() => setSelectedType(request.id)}
                  className={`assistance-btn aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 p-4 ${
                    isSelected
                      ? "bg-brand-wood text-white shadow-lg"
                      : "bg-white text-stone-600 hover:bg-stone-50 shadow-soft"
                  }`}
                >
                  <Icon className={`w-8 h-8 ${isSelected ? "text-white" : "text-brand-wood"}`} />
                  <span className="text-sm font-medium">{request.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
          <button
            data-testid="request-type-altro"
            onClick={() => setSelectedType("altro")}
            className={`w-full p-4 rounded-2xl flex items-center gap-3 ${
              selectedType === "altro"
                ? "bg-brand-wood text-white shadow-lg"
                : "bg-white text-stone-600 hover:bg-stone-50 shadow-soft"
            }`}
          >
            <MessageSquare className={`w-6 h-6 ${selectedType === "altro" ? "text-white" : "text-brand-wood"}`} />
            <span className="font-medium">Altra Richiesta</span>
          </button>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <label className="block text-sm font-medium text-stone-600 mb-2">
            Note Aggiuntive
          </label>
          <Textarea
            data-testid="notes-textarea"
            placeholder="Descrivi la tua richiesta..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px] rounded-2xl border-stone-200 bg-white resize-none focus:border-brand-green focus:ring-brand-green"
          />
        </div>

        <div className="pt-4 animate-fade-in" style={{ animationDelay: "250ms" }}>
          <Button
            data-testid="submit-request-button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 bg-brand-green hover:bg-brand-green-hover text-white rounded-full text-lg font-medium shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <Send className="w-5 h-5" />
            {submitting ? "Invio in corso..." : "Invia Richiesta"}
          </Button>
        </div>
      </div>
    </div>
  );
}
