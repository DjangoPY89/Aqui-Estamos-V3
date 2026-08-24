"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, Search, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PreguntasFrecuentesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Cómo realizo mi reserva?",
      a: "Puedes realizar tu reserva directamente a través de nuestra plataforma web en menos de 60 segundos, seleccionando la duración (4h, 6h u 8h), fecha, hora y método de pago. También puedes coordinar vía WhatsApp al (0984) 320-528.",
    },
    {
      q: "¿Cómo funciona el servicio una vez agendado?",
      a: "Una vez confirmada la reserva, nuestro profesional asignado se presentará en el domicilio y horario acordado (08:00 AM turno mañana o 13:00 PM turno tarde) debidamente uniformado y con identificación oficial. Al finalizar el servicio, puedes verificar que todo haya quedado a tu entera satisfacción y calificar la atención desde tu portal de cliente.",
    },
    {
      q: "¿Estoy protegido contra contingencias o demandas laborales?",
      a: "Sí, absolutamente. En Aquí Estamos somos los empleadores directos de todos los profesionales. Nuestro personal cuenta con cobertura en el Instituto de Previsión Social (IPS) y cumplimiento con el MTESS. En caso de existir cualquier eventualidad, nosotros nos hacemos 100% responsables.",
    },
    {
      q: "¿Cuál es el proceso de selección de los profesionales?",
      a: "Nuestros profesionales pasan por un riguroso proceso de selección y reclutamiento que incluye: verificación exhaustiva de antecedentes policiales y judiciales, comprobación de certificado de vida y residencia, validación de referencias laborales anteriores y test psicométrico de idoneidad y honestidad.",
    },
    {
      q: "¿Debo contar con productos de limpieza en casa?",
      a: "Nuestra tarifa estándar de servicio de mano de obra no incluye los productos químicos e insumos de limpieza descartables. Debes disponer de los productos habituales en tu hogar (detergentes, lavandina, trapos, escoba, aspiradora). Si lo necesitas, nuestro profesional con gusto te elaborará un listado de recomendaciones.",
    },
    {
      q: "¿Qué incluye mi servicio de limpieza?",
      a: "Cada servicio incluye: limpieza profunda y desinfección de baños, limpieza de cocina y mesadas, barrido, aspirado y trapeado de pisos, sacudido de polvo en muebles, organización general de habitaciones y áreas sociales, así como lavado/doblado de prendas según el tiempo disponible contratado.",
    },
    {
      q: "¿Qué NO incluye el servicio por seguridad?",
      a: "Cuidando la integridad física de nuestros profesionales y la seguridad de tu hogar, no realizamos: apertura de puertas a terceros, cuidado de niños o adultos mayores, trámites o mandados fuera del domicilio, ni trabajos de limpieza en altura sin arnés.",
    },
    {
      q: "¿Tiene penalidad cancelar o reprogramar el servicio?",
      a: "La cancelación o reprogramación del servicio es 100% gratuita si se realiza con al menos 24 horas de anticipación a la fecha programada. Dentro de las 24 horas previas, aplica una penalidad del 50% debido a la reserva exclusiva de agenda del profesional.",
    },
    {
      q: "¿A qué hora llegan los profesionales?",
      a: "El horario estándar de turno mañana es a las 08:00 AM (o 09:00 AM según tu selección). Para turno tarde, la llegada es a las 13:00 PM o 14:00 PM.",
    },
    {
      q: "¿Debo brindarle almuerzo al profesional?",
      a: "No es necesario. Nuestros profesionales llevan su propia vianda de almuerzo para la jornada. Lo único que solicitamos amablemente es permitirles utilizar la heladera para conservarla.",
    },
    {
      q: "¿Es obligatorio que permanezca en casa durante la limpieza?",
      a: "No es obligatorio. Nuestro personal cuenta con verificación de antecedentes y máxima confiabilidad. Puedes recibir al profesional al inicio, dejar las indicaciones deseadas y salir a tus actividades habituales.",
    },
    {
      q: "¿Puedo pagar directamente al profesional de limpieza?",
      a: "No. Toda la gestión administrativa y pagos se realizan directamente a través de Aquí Estamos (efectivo contra entrega, transferencia bancaria SIPAP o tarjeta). Nosotros nos encargamos de liquidar formalmente los honorarios del personal.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            Centro de Ayuda
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Preguntas Frecuentes
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Todo lo que necesitas saber sobre nuestros servicios de limpieza profesional en Paraguay.
          </p>

          {/* Buscador de Preguntas */}
          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por palabra clave (ej: IPS, productos, cancelar, horarios)..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl text-sm shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Acordeón de FAQs */}
        <div className="space-y-3 mb-16">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in-50 duration-150">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tarjeta de Contacto Directo */}
        <div className="bg-gradient-to-r from-blue-600 to-sky-600 rounded-3xl p-8 text-white text-center shadow-xl">
          <h3 className="text-xl font-bold mb-2">¿Tienes otra consulta no listada?</h3>
          <p className="text-sm text-blue-100 mb-6 max-w-md mx-auto">
            Nuestro equipo de atención al cliente está disponible los 7 días de la semana de 08:00 a 20:00 hs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/595984320528?text=Hola%20tengo%20una%20pregunta%20sobre%20el%20servicio"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-blue-900 font-bold text-xs rounded-xl shadow-sm hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Chatear al (0984) 320-528</span>
            </a>
            <Link
              href="/reservar"
              className="px-6 py-3 bg-blue-900/40 hover:bg-blue-900/60 text-white font-bold text-xs rounded-xl border border-white/20 transition-all"
            >
              Reservar Online Ahora
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
