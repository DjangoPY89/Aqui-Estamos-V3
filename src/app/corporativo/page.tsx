"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Phone, 
  Send, 
  ArrowRight,
  Sparkles,
  Users,
  Award,
  Check,
  ChevronRight,
  Shield,
  Layers,
  HelpCircle,
  Briefcase
} from "lucide-react";

export default function CorporativoPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    ruc: "",
    facilityType: "Oficinas Administrativas",
    contactName: "",
    phone: "",
    email: "",
    requirements: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.companyName || !formData.contactName || !formData.phone) {
      setErrorMsg("Por favor completa los campos requeridos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/corporate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al enviar solicitud.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al enviar la solicitud. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900 selection:bg-electric-500 selection:text-white">
      
      {/* Hero Section Minimalista B2B */}
      <section className="relative pt-20 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-white border-b border-neutral-200/80">
        {/* Glows sutiles de fondo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-electric-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge Minimalista */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wide shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-electric-400" />
                <span>Facility Services & Mantenimiento Corporativo</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 tracking-tight leading-[1.1]">
                Excelencia operativa y discreción para su <br className="hidden sm:inline" />
                <span className="text-electric-600">sede corporativa.</span>
              </h1>

              <p className="text-neutral-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Nos integramos como su socio estratégico en el cuidado de imagen institucional. Provisión de personal formal con <strong>cobertura total de IPS</strong>, facturación legal con RUC mensualizada y supervisión técnica continua en Asunción y Gran Asunción.
              </p>

              {/* Botones de Acción */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <a
                  href="#cotizar"
                  className="px-6 py-3.5 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-electric transition-all active:scale-[0.99] flex items-center gap-2"
                >
                  <span>Solicitar Propuesta a Medida</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="https://wa.me/595984320528?text=Hola,%20deseo%20solicitar%20una%20propuesta%20corporativa%20B2B%20para%20nuestra%20empresa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs sm:text-sm rounded-xl border border-neutral-300 hover:border-neutral-400 transition-all flex items-center gap-2 shadow-xs"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp: (0984) 320-528</span>
                </a>
              </div>

              {/* Métricas de Confianza en Tarjetas Minimalistas */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-neutral-100">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <p className="text-xl sm:text-2xl font-black text-neutral-900">100%</p>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Seguro IPS & MTESS</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <p className="text-xl sm:text-2xl font-black text-electric-600">&lt; 2 hs</p>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Respuesta Comercial</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
                  <p className="text-xl sm:text-2xl font-black text-emerald-600">0%</p>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Pasivo Laboral Cliente</p>
                </div>
              </div>
            </div>

            {/* Imagen Fotográfica Elegante */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200 aspect-[4/3] sm:aspect-square bg-neutral-100">
                <Image
                  src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=80"
                  alt="Instalaciones Corporativas Modernas"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
                
                {/* Floating Card */}
                <div className="absolute bottom-5 left-5 right-5 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-neutral-200 shadow-lg text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="font-bold text-neutral-900">Cobertura en Torres Corporativas</p>
                  </div>
                  <p className="text-neutral-500 text-[11px] leading-relaxed">
                    Eje Corporativo Santa Teresa, Villa Morra, World Trade Center y plantas industriales.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pilares de Valor B2B */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-electric-600 bg-electric-50 px-3 py-1 rounded-full border border-electric-100">
            Seguridad & Respaldo
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-3">
            Garantías operativas para la gerencia
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Eliminamos contingencias operativas y legales para que su equipo se enfoque en el negocio principal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-3xl border border-neutral-200/90 shadow-xs hover:shadow-md transition-all space-y-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-electric-50 text-electric-600 border border-electric-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              Gestión Administrativa & Factura con RUC
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
              Emitimos facturas legales mensuales detalladas. Cumplimos al 100% con la normativa del Ministerio de Trabajo (MTESS) e IPS, garantizando <strong>cero riesgo o pasivo laboral</strong> para su organización.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-3xl border border-neutral-200/90 shadow-xs hover:shadow-md transition-all space-y-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              Confidencialidad & Verificación de Personal
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
              Todo el personal asignado cuenta con verificación de antecedentes judiciales y policiales, referencias comerciales auditadas y firma de <strong>acuerdos de confidencialidad (NDA)</strong>.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-3xl border border-neutral-200/90 shadow-xs hover:shadow-md transition-all space-y-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              Turnos Flexibles & Cobertura de Reemplazos
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
              Horarios adaptados a su ritmo: antes del inicio de oficina (06:00 AM), jornadas continuas o limpieza nocturna tras el cierre, con <strong>reemplazo inmediato ante cualquier ausencia</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Tipos de Instalaciones Atendidas */}
      <section className="py-14 bg-white border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Soluciones a medida según su tipo de inmueble
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[
              { icon: Building2, label: "Plantas Ejecutivas & Oficinas", desc: "Mantenimiento diario de puestos y salas de reuniones" },
              { icon: Briefcase, label: "Locales & Showrooms", desc: "Cristales, pisos de alto tránsito y áreas de exhibición" },
              { icon: Shield, label: "Clínicas & Laboratorios", desc: "Desinfección profunda con insumos de grado hospitalario" },
              { icon: Award, label: "Bancos & Embajadas", desc: "Máxima discreción, protocolos estrictos y seguridad" },
              { icon: Layers, label: "Naves & Centros Logísticos", desc: "Grandes superficies y zonas de almacenamiento" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-electric-300 hover:bg-white transition-all space-y-2 text-left shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-electric-600">
                  <item.icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{item.label}</h4>
                <p className="text-[11px] text-neutral-500 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabla Comparativa: Aquí Estamos B2B vs Contratación Informal */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-black text-neutral-900">
            ¿Por qué tercerizar su servicio con Aquí Estamos?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1.5">
            Compare la tranquilidad operativa frente a esquemas tradicionales.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden text-xs sm:text-sm">
          <div className="grid grid-cols-12 bg-slate-900 text-white font-bold p-4 text-left">
            <div className="col-span-6 sm:col-span-5">Aspecto Operativo / Legal</div>
            <div className="col-span-3 sm:col-span-4 text-electric-300">Aquí Estamos B2B</div>
            <div className="col-span-3 text-slate-400">Contratación Directa</div>
          </div>

          <div className="divide-y divide-neutral-100">
            {[
              { aspect: "Aporte Obrero-Patronal IPS", ae: "100% Asumido y al día", ind: "Riesgo de multas y demandas" },
              { aspect: "Facturación Legal con RUC", ae: "Factura Crédito / Contado con IVA", ind: "Sin comprobantes deducibles" },
              { aspect: "Cobertura de Reposo / Vacaciones", ae: "Reemplazo inmediato garantizado", ind: "Sede desatendida o costo extra" },
              { aspect: "Insumos & Equipos Profesionales", ae: "Incluidos según requerimiento", ind: "Gestión de compras y logística" },
              { aspect: "Pasivo y Carga Administrativa", ae: "0 horas dedicadas por su RRHH", ind: "Liquidaciones, aguinaldos y trámites" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-12 p-3.5 sm:p-4 text-left items-center hover:bg-neutral-50/60 transition-colors">
                <div className="col-span-6 sm:col-span-5 font-semibold text-neutral-900 text-xs">
                  {row.aspect}
                </div>
                <div className="col-span-3 sm:col-span-4 text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{row.ae}</span>
                </div>
                <div className="col-span-3 text-neutral-400 text-xs">
                  {row.ind}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de Cotización B2B Minimalista */}
      <section id="cotizar" className="py-16 sm:py-20 bg-gradient-to-b from-white to-neutral-100 border-t border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-neutral-200/50">
            
            {submitted ? (
              <div className="text-center py-10 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                  ¡Solicitud Corporativa Recibida!
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                  El equipo comercial de <strong>Aquí Estamos</strong> revisará las necesidades de <strong>{formData.companyName}</strong> y le enviará la propuesta técnica y económica formal en menos de 2 horas.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                  <a
                    href={`https://wa.me/595984320528?text=Hola,%20acabo%20de%20enviar%20una%20solicitud%20para%20${encodeURIComponent(formData.companyName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Contactar Asesor B2B por WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        companyName: "",
                        ruc: "",
                        facilityType: "Oficinas Administrativas",
                        contactName: "",
                        phone: "",
                        email: "",
                        requirements: "",
                      });
                    }}
                    className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Enviar otra solicitud
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-8 text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-electric-600 bg-electric-50 px-2.5 py-1 rounded-md border border-electric-100">
                    Propuesta Sin Compromiso
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 mt-2 tracking-tight">
                    Solicitar Propuesta Comercial B2B
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    Complete los datos de su empresa y coordinaremos una evaluación técnica sin costo.
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        Razón Social / Empresa *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Ej: Inversiones del Sol S.A."
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        RUC
                      </label>
                      <input
                        type="text"
                        value={formData.ruc}
                        onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                        placeholder="80000000-0"
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        Tipo de Instalación *
                      </label>
                      <select
                        value={formData.facilityType}
                        onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 font-medium focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                      >
                        <option value="Oficinas Administrativas">Oficinas Administrativas / Plantas</option>
                        <option value="Local Comercial / Showroom">Local Comercial / Showroom</option>
                        <option value="Consultorio / Clínica Médica">Consultorio / Clínica Médica</option>
                        <option value="Embajada / Organismo">Embajada / Organismo Internacional</option>
                        <option value="Depósito / Nave Industrial">Depósito / Nave Industrial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        Persona de Contacto *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="Nombre y Apellido del Responsable"
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        Teléfono / WhatsApp de Contacto *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0981 123 456"
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        Correo Electrónico Corporativo
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contacto@empresa.com.py"
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">
                      Frecuencia y Requerimientos Especiales
                    </label>
                    <textarea
                      rows={3}
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Ej: Requerimos 2 limpiadores de lunes a viernes en horario matutino (06:00 a 14:00), m2 aproximados del local o insumos especiales..."
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 bg-slate-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "Enviando Solicitud..." : "Enviar Solicitud de Propuesta Corporativa"}</span>
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </section>

    </div>
  );
}
