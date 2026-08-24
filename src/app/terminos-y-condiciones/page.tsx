import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          
          <div className="border-b border-slate-100 pb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Legal y Contratos</span>
            <h1 className="text-3xl font-black text-slate-900 mt-1">Términos y Condiciones del Servicio</h1>
            <p className="text-xs text-slate-500 mt-2">Última actualización: Agosto 2026 • República del Paraguay</p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Objeto del Servicio</h2>
              <p>
                Aquí Estamos Cleaning Services presta servicios profesionales de limpieza doméstica y corporativa en la ciudad de Asunción y Gran Asunción. Las reservas realizadas a través de la plataforma web constituyen un acuerdo vinculante de prestación de servicios.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Relación Laboral y Cobertura Patronal</h2>
              <p>
                Todo el personal asignado a los servicios es contratado y dependiente directamente de Aquí Estamos, cumpliendo con la inscripción formal ante el Instituto de Previsión Social (IPS) y las normativas del Ministerio de Trabajo, Empleo y Seguridad Social (MTESS). El cliente queda 100% liberado de cualquier responsabilidad o contingencia laboral.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Política de Cancelación y Reprogramación</h2>
              <p>
                - <strong>Cancelaciones con más de 24 horas de antelación:</strong> Son 100% gratuitas y sin penalización.<br />
                - <strong>Cancelaciones dentro de las 24 horas previas:</strong> Devengan una penalidad del 50% del valor total acordado, para compensar el bloqueo de agenda y viáticos del profesional asignado.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Formas de Pago y Facturación</h2>
              <p>
                Los pagos pueden efectuarse en efectivo al recibir el servicio, transferencia bancaria (SIPAP) o tarjeta. Para servicios residenciales o corporativos se emiten facturas legales con RUC según requerimiento del cliente.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Garantía de Satisfacción 200%</h2>
              <p>
                Si el cliente considera que alguna de las áreas contratadas no fue limpiada conforme al estándar acordado, deberá notificar a Aquí Estamos dentro de las 24 horas siguientes para coordinar una corrección sin costo adicional.
              </p>
            </section>
          </div>

        </div>

      </div>
    </div>
  );
}
