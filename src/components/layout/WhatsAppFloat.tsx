"use client";

import React from "react";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/595984320528?text=Hola%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios%20de%20limpieza"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-lg shadow-[#25D366]/35 hover:shadow-xl hover:shadow-[#25D366]/50 transition-all hover:scale-105 group"
      aria-label="Contactar por WhatsApp"
    >
      <div className="relative flex items-center justify-center">
        <svg
          className="w-6 h-6 fill-white text-white transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.996.586 3.86 1.6 5.432L2 22l4.71-1.543c1.517.917 3.292 1.443 5.188 1.443 5.535 0 10.031-4.496 10.031-10.031C21.929 6.496 17.566 2 12.031 2zm0 18.33c-1.636 0-3.18-.46-4.512-1.266l-.323-.194-3.13.826.837-3.05-.21-.334A8.257 8.257 0 013.731 12.03c0-4.577 3.723-8.3 8.3-8.3 4.577 0 8.3 3.723 8.3 8.3 0 4.577-3.723 8.3-8.3 8.3zm4.55-6.22c-.25-.125-1.477-.73-1.706-.813-.23-.083-.396-.125-.563.125-.166.25-.646.813-.792.98-.146.166-.292.187-.542.062s-1.056-.39-2.012-1.242c-.744-.664-1.246-1.485-1.392-1.735-.146-.25-.015-.385.11-.51.112-.112.25-.292.375-.438.125-.146.167-.25.25-.417.083-.166.042-.312-.02-.437-.063-.125-.563-1.355-.772-1.855-.203-.487-.41-.421-.563-.429l-.479-.008c-.167 0-.438.063-.667.313-.23.25-.875.854-.875 2.083 0 1.229.896 2.417 1.021 2.583.125.167 1.764 2.694 4.274 3.777.597.258 1.064.412 1.428.528.6.191 1.146.164 1.577.1.48-.072 1.477-.604 1.685-1.188.209-.583.209-1.083.146-1.188-.062-.104-.229-.166-.479-.291z"
          />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
          <span className="w-2 h-2 bg-[#25D366] rounded-full animate-ping"></span>
        </span>
      </div>
      <div className="hidden sm:block text-left pr-1">
        <p className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-100 leading-none">¿Dudas?</p>
        <p className="text-xs font-bold leading-tight">Chatea con nosotros</p>
      </div>
    </a>
  );
}
