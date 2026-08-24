"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { 
  User as UserIcon, 
  Menu, 
  X, 
  Calendar, 
  LogOut, 
  ChevronDown,
  LayoutDashboard,
  Building2
} from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-40 flex items-center">
              <Image
                src="/images/logo.jpeg"
                alt="Aquí Estamos"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-neutral-600">
            <Link href="/#servicios" className="hover:text-neutral-950 transition-colors">
              Servicios
            </Link>
            <Link href="/#como-funciona" className="hover:text-neutral-950 transition-colors">
              Cómo Funciona
            </Link>
            <Link href="/#precios" className="hover:text-neutral-950 transition-colors">
              Precios
            </Link>
            <Link href="/corporativo" className="hover:text-neutral-950 transition-colors">
              Corporativo B2B
            </Link>
            <Link href="/preguntas-frecuentes" className="hover:text-neutral-950 transition-colors">
              Preguntas Frecuentes
            </Link>
          </nav>

          {/* Acciones */}
          <div className="hidden lg:flex items-center gap-3.5">
            {/* WhatsApp con Icono Destacado */}
            <a
              href="https://wa.me/595984320528"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-bold text-neutral-700 hover:text-emerald-600 transition-all px-3 py-1.5 rounded-xl hover:bg-emerald-50/70 border border-neutral-200/80 hover:border-emerald-200 shadow-2xs hover:shadow-xs group"
            >
              <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none">
                <path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" />
                <path fill="#FFFFFF" d="M17.47 14.38C17.17 14.23 15.7 13.51 15.43 13.41C15.15 13.31 14.95 13.26 14.75 13.56C14.55 13.86 13.98 14.53 13.81 14.73C13.63 14.93 13.46 14.95 13.16 14.8C12.86 14.65 11.89 14.33 10.75 13.31C9.85 12.51 9.25 11.53 9.07 11.23C8.9 10.93 9.05 10.77 9.2 10.62C9.34 10.49 9.5 10.28 9.65 10.1C9.8 9.93 9.85 9.8 9.95 9.6C10.05 9.4 10 9.23 9.93 9.08C9.85 8.93 9.28 7.53 9.05 6.96C8.82 6.4 8.59 6.48 8.42 6.47C8.26 6.46 8.07 6.46 7.87 6.46C7.67 6.46 7.35 6.53 7.07 6.83C6.8 7.13 6.02 7.86 6.02 9.33C6.02 10.8 7.09 12.22 7.24 12.42C7.39 12.62 9.35 15.64 12.35 16.94C13.06 17.25 13.63 17.44 14.06 17.58C14.78 17.81 15.43 17.77 15.95 17.7C16.53 17.61 17.73 16.97 17.98 16.27C18.23 15.57 18.23 14.97 18.15 14.85C18.08 14.73 17.88 14.65 17.58 14.5L17.47 14.38Z" />
              </svg>
              <span>(0984) 320-528</span>
            </a>

            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-neutral-200 bg-white hover:bg-electric-50 text-neutral-800 text-xs font-medium transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-electric-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {session.user.name?.charAt(0) || "U"}
                  </span>
                  <span className="max-w-[100px] truncate">{session.user.name?.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-neutral-100">
                      <p className="font-semibold text-neutral-900 truncate">{session.user.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{session.user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-electric-50 text-electric-700 text-[10px] font-bold rounded border border-electric-100">
                          ADMIN
                        </span>
                      )}
                    </div>

                    <Link
                      href="/portal"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-electric-50 hover:text-electric-700 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-electric-600" />
                      Mis Reservas
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-neutral-900 font-semibold hover:bg-electric-50 hover:text-electric-700 transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-electric-600" />
                        Panel Admin
                      </Link>
                    )}

                    <div className="border-t border-neutral-100 my-1"></div>

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium text-neutral-700 hover:text-electric-600 px-3 py-1.5 rounded-lg hover:bg-electric-50 transition-colors"
              >
                Ingresar
              </Link>
            )}

            <Link
              href="/reservar"
              className="bg-electric-600 hover:bg-electric-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-electric-sm transition-all active:scale-[0.98]"
            >
              Reservar Servicio
            </Link>
          </div>

          {/* Menú Móvil Botón */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/reservar"
              className="bg-electric-600 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-xs"
            >
              Reservar
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-neutral-700 rounded-md hover:bg-neutral-100 focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-2 text-sm">
          <Link
            href="/#servicios"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-neutral-700 hover:text-neutral-950 font-medium"
          >
            Servicios
          </Link>
          <Link
            href="/#como-funciona"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-neutral-700 hover:text-neutral-950 font-medium"
          >
            Cómo Funciona
          </Link>
          <Link
            href="/#precios"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-neutral-700 hover:text-neutral-950 font-medium"
          >
            Precios
          </Link>
          <Link
            href="/corporativo"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-neutral-700 hover:text-neutral-950 font-medium"
          >
            Corporativo B2B
          </Link>
          <Link
            href="/preguntas-frecuentes"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-neutral-700 hover:text-neutral-950 font-medium"
          >
            Preguntas Frecuentes
          </Link>

          <a
            href="https://wa.me/595984320528"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 shadow-2xs"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" />
              <path fill="#FFFFFF" d="M17.47 14.38C17.17 14.23 15.7 13.51 15.43 13.41C15.15 13.31 14.95 13.26 14.75 13.56C14.55 13.86 13.98 14.53 13.81 14.73C13.63 14.93 13.46 14.95 13.16 14.8C12.86 14.65 11.89 14.33 10.75 13.31C9.85 12.51 9.25 11.53 9.07 11.23C8.9 10.93 9.05 10.77 9.2 10.62C9.34 10.49 9.5 10.28 9.65 10.1C9.8 9.93 9.85 9.8 9.95 9.6C10.05 9.4 10 9.23 9.93 9.08C9.85 8.93 9.28 7.53 9.05 6.96C8.82 6.4 8.59 6.48 8.42 6.47C8.26 6.46 8.07 6.46 7.87 6.46C7.67 6.46 7.35 6.53 7.07 6.83C6.8 7.13 6.02 7.86 6.02 9.33C6.02 10.8 7.09 12.22 7.24 12.42C7.39 12.62 9.35 15.64 12.35 16.94C13.06 17.25 13.63 17.44 14.06 17.58C14.78 17.81 15.43 17.77 15.95 17.7C16.53 17.61 17.73 16.97 17.98 16.27C18.23 15.57 18.23 14.97 18.15 14.85C18.08 14.73 17.88 14.65 17.58 14.5L17.47 14.38Z" />
            </svg>
            <span>WhatsApp: (0984) 320-528</span>
          </a>

          <div className="pt-3 border-t border-neutral-100 space-y-3">
            {session?.user ? (
              <div className="space-y-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80">
                <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-200">
                  <span className="w-8 h-8 rounded-full bg-electric-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {session.user.name?.charAt(0) || "U"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-neutral-900 truncate">{session.user.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{session.user.email}</p>
                  </div>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 bg-electric-100 text-electric-800 text-[10px] font-extrabold rounded">
                      ADMIN
                    </span>
                  )}
                </div>

                <Link
                  href="/portal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-2 text-xs font-semibold text-neutral-800 hover:text-electric-600 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-electric-600" />
                  <span>Mis Reservas & Direcciones</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 px-2 text-xs font-bold text-neutral-900 hover:text-electric-600 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-electric-600" />
                    <span>Panel de Administración</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center gap-2 w-full text-left py-2 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Botón Iniciar Sesión con Google */}
                <GoogleSignInButton
                  callbackUrl="/portal"
                  text="Continuar con Google"
                />

                <div className="relative flex items-center justify-center py-0.5">
                  <div className="border-t border-neutral-200 w-full" />
                  <span className="bg-white px-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    o con tu correo
                  </span>
                  <div className="border-t border-neutral-200 w-full" />
                </div>

                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 bg-neutral-100 hover:bg-neutral-200/80 active:bg-neutral-200 rounded-xl text-neutral-800 font-bold text-xs transition-colors"
                >
                  Ingresar con Correo y Contraseña
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
