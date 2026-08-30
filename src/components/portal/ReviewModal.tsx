"use client";

import React, { useState, useEffect } from "react";
import { Star, X, CheckCircle2, Sparkles, RefreshCw, UserCheck, ShieldCheck, ThumbsUp, Heart } from "lucide-react";
import { Booking } from "@/types";

interface ReviewModalProps {
  isOpen: boolean;
  booking: Booking | null;
  rating: number;
  setRating: (r: number) => void;
  comment: string;
  setComment: (c: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
  isSuccess: boolean;
}

export default function ReviewModal({
  isOpen,
  booking,
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
  onClose,
  isSubmitting,
  isSuccess,
}: ReviewModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !booking) return null;

  const assignedCleaner = (booking as any).employeeName || (booking as any).assignedTo || booking.assignedCleaner || "Profesional de Cuadrilla Aquí Estamos";
  const hours = (booking as any).hours || booking.serviceHours || 4;
  const bookingNum = (booking as any).bookingNumber || booking.id.slice(-4);

  const labels = [
    "1/5 - Muy Insatisfecho 😞",
    "2/5 - Regular / Por mejorar 😐",
    "3/5 - Buen Servicio 🙂",
    "4/5 - Muy Buen Trabajo 😊",
    "5/5 - ¡Excelente y Recomendada! 🌟",
  ];

  const quickTags = [
    "⚡ Muy puntual",
    "✨ Limpieza impecable",
    "🛡️ Trato amable y educado",
    "🧼 Cuidado minucioso de objetos",
    "👌 Dejó todo reluciente",
    "🏠 Muy confiable",
  ];

  const toggleTag = (tag: string) => {
    let updated: string[];
    if (selectedTags.includes(tag)) {
      updated = selectedTags.filter((t) => t !== tag);
    } else {
      updated = [...selectedTags, tag];
    }
    setSelectedTags(updated);

    const baseText = comment.replace(/\n\nDestacado: .*/, "").trim();
    if (updated.length > 0) {
      setComment(baseText ? `${baseText}\n\nDestacado: ${updated.join(", ")}` : `Destacado: ${updated.join(", ")}`);
    } else {
      setComment(baseText);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 space-y-5"
      >
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-10 space-y-4 animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">¡Calificación Registrada!</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Tu valoración a <strong>{assignedCleaner}</strong> nos ayuda a reconocer el buen desempeño de nuestro personal con seguro de IPS.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 rounded-full text-xs font-bold border border-amber-200">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{rating} / 5 Estrellas otorgadas</span>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            
            {/* Header del Modal */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-black border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Evaluación de Desempeño</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Calificar a la Empleada del Servicio
              </h3>
              <p className="text-xs text-slate-500">
                Reserva #{bookingNum} • Realizado el {booking.serviceDate} ({hours} Horas)
              </p>
            </div>

            {/* Tarjeta Destacada de la Empleada Asignada */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950 text-white flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                  {assignedCleaner.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 block">
                    Personal de Limpieza
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                    {assignedCleaner}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Verificada en IPS</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-300 block">Turno</span>
                <span className="text-xs font-bold text-white font-mono">{booking.serviceTime} hs</span>
              </div>
            </div>

            {/* Selector de Estrellas Interactivas */}
            <div className="py-4 px-3 text-center space-y-2.5 bg-amber-50/50 rounded-2xl border border-amber-200/70">
              <span className="text-xs font-bold text-slate-700 block">
                ¿Qué puntuación le das al trabajo de {assignedCleaner}?
              </span>

              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-all hover:scale-125 active:scale-95 focus:outline-none"
                    title={`${star} estrellas`}
                  >
                    <Star
                      className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                        star <= rating
                          ? "text-amber-400 fill-amber-400 drop-shadow-md"
                          : "text-slate-300 hover:text-amber-200"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <p className="text-xs font-black text-amber-900">
                {labels[rating - 1]}
              </p>
            </div>

            {/* Chips de Aspectos Destacados */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                ¿Qué aspectos destacarías de su servicio? (Opcional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-amber-500 text-white shadow-xs scale-102"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comentario Adicional */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Comentarios o mensaje para {assignedCleaner}:
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cuéntanos detalles de la limpieza o déjale un agradecimiento..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Botones de Envío */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/25 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando Calificación...</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-white" />
                    <span>Confirmar Calificación a {assignedCleaner.split(" ")[0]}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all active:scale-98 cursor-pointer"
              >
                Cancelar
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
