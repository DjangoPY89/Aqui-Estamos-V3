import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-neutral-400 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800/80">
          
          {/* Marca */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative h-10 w-40">
              <Image
                src="/images/logo-white.svg"
                alt="Aquí Estamos"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Servicios profesionales de limpieza residencial y corporativa en Asunción y Gran Asunción. Personal asegurado en IPS y garantía total de satisfacción.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://www.instagram.com/aquiestamospy/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-electric-600 flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/595984320528"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-electric-600 flex items-center justify-center text-white transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Servicios */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-electric-400">Servicios</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/reservar" className="hover:text-electric-300 transition-colors">
                  Express (4 Horas)
                </Link>
              </li>
              <li>
                <Link href="/reservar" className="hover:text-electric-300 transition-colors">
                  Integral (6 Horas)
                </Link>
              </li>
              <li>
                <Link href="/reservar" className="hover:text-electric-300 transition-colors">
                  Full Day (8 Horas)
                </Link>
              </li>
              <li>
                <Link href="/corporativo" className="hover:text-electric-300 transition-colors">
                  Corporativo B2B
                </Link>
              </li>
            </ul>
          </div>

          {/* Información Legal */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-electric-400">Información</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/preguntas-frecuentes" className="hover:text-electric-300 transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones" className="hover:text-electric-300 transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-electric-300 transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/politica-calidad" className="hover:text-electric-300 transition-colors">
                  Política de Calidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-electric-400">Contacto</h4>
            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/595984320528"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white font-semibold hover:text-electric-300 transition-colors"
              >
                (0984) 320-528
              </a>
              <p className="text-neutral-400">
                Atención 7 días: 08:00 a 20:00 hs
              </p>
              <p className="text-neutral-400">
                Asunción y Gran Asunción
              </p>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <p>© {new Date().getFullYear()} Aquí Estamos. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-2 text-neutral-400">
            <span>Asunción</span> • <span>Luque</span> • <span>San Lorenzo</span> • <span>Lambaré</span> • <span>Villa Morra</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
