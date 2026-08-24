import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacidadPage() {
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
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Seguridad de la Información</span>
            <h1 className="text-3xl font-black text-slate-900 mt-1">Políticas de Privacidad y Protección de Datos</h1>
            <p className="text-xs text-slate-500 mt-2">Vigente desde 2026 • Aquí Estamos Cleaning Services</p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Recolección de Datos Personales</h2>
              <p>
                Recopilamos únicamente la información indispensable para coordinar y ejecutar la prestación de servicios (nombre, teléfono, correo electrónico, dirección física y geolocalización para la llegada del personal).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Autenticación con Google y Apple ID</h2>
              <p>
                Al utilizar el inicio de sesión mediante Google o Apple ID, únicamente obtenemos los datos de perfil básico (nombre, correo y foto de perfil) autorizados por el usuario. Nunca tenemos acceso a sus contraseñas ni a su cuenta personal en dichas plataformas.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Confidencialidad y Uso Interno</h2>
              <p>
                Sus datos jamás serán vendidos, cedidos ni compartidos con empresas de publicidad de terceros. Son utilizados estrictamente para la gestión de su reserva, facturación y soporte posventa.
              </p>
            </section>
          </div>

        </div>

      </div>
    </div>
  );
}
