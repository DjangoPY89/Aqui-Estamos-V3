import React from "react";
import { Sparkles, Building2, Home } from "lucide-react";

export default function TrustBar() {
  const clients = [
    { name: "Torres del Paseo", type: "Edificio Residencial" },
    { name: "Civis Inmobiliaria", type: "Desarrolladora" },
    { name: "Trinity Towers", type: "Condominio" },
    { name: "Diario 5 Días", type: "Corporativo" },
    { name: "Carlos González", type: "Residencial Villa Morra" },
  ];

  return (
    <section className="py-7 bg-white border-b border-neutral-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 shrink-0">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
              ✓
            </span>
            <span>La confianza de más de <strong className="text-neutral-950 font-black">+1.500 hogares y edificios</strong> en:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
            {clients.map((c, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-50 hover:bg-blue-50 border border-neutral-200 hover:border-blue-200 text-neutral-800 text-xs font-semibold transition-all duration-200 shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-electric-500"></span>
                <span>{c.name}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
