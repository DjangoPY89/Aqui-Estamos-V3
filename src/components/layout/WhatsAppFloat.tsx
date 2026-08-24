"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/595984320528?text=Hola%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios%20de%20limpieza"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all hover:scale-105 group"
      aria-label="Contactar por WhatsApp"
    >
      <div className="relative">
        <MessageCircle className="w-6 h-6 fill-white text-emerald-500" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
        </span>
      </div>
      <div className="hidden sm:block text-left pr-1">
        <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-100 leading-none">¿Dudas?</p>
        <p className="text-xs font-bold leading-tight">Chatea con nosotros</p>
      </div>
    </a>
  );
}
