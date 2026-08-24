import React from "react";

export default function TrustBar() {
  const clients = [
    "Trinity Towers",
    "Civis Inmobiliaria",
    "Carlos González",
    "Diario 5 Días",
    "Torres del Paseo",
  ];

  return (
    <section className="py-8 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Con la confianza de clientes y edificios en:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-neutral-600">
            {clients.map((c, i) => (
              <span key={i} className="hover:text-neutral-900 transition-colors">
                {c}
              </span>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
