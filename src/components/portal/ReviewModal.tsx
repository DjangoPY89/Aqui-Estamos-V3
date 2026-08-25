"use client";

import React from "react";
import { Star, X, CheckCircle2, Sparkles, RefreshCw } from "lucide-react";
import { Booking } from "@/types";

interface ReviewModalProps {
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
  if (!booking) return null;

  const labels = [
    "Muy Insatisfecho 😞",
    "Regular 😐",
    "Buen Servicio 🙂",
    "Muy Bueno 😊",
    "¡Excelente y Recomendado! 🌟",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8 space-y-5">
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-3 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">¡Muchas Gracias por tu Calificación!</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Tu opinión nos impulsa a seguir brindando el servicio de limpieza más confiable de Paraguay.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-md text-[10px] font-black border border-amber-200">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Tu Opinión es Fundamental</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Calificar Servicio #{booking.bookingNumber || booking.id.slice(-4)}
              </h3>
              <p className="text-xs text-slate-500">
                ¿Qué tal fue la atención y limpieza del {booking.serviceDate}?
              </p>
            </div>

            {/* Estrellas Interactivas */}
            <div className="py-3 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-black text-amber-800 font-sans">
                {labels[rating - 1]}
              </p>
            </div>

            {/* Comentario Opcional */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Comentario o sugerencia (Opcional):
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cuéntanos qué fue lo que más te gustó o qué detalle podemos mejorar..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
              />
            </div>

            {/* Botones de Envío */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enviando Reseña...</span>
                  </>
                ) : (
                  <span>Enviar Calificación ⭐</span>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
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
