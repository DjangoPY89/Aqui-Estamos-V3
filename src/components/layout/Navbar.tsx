"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  User as UserIcon, 
  Menu, 
  X, 
  Calendar, 
  LogOut, 
  ChevronDown,
  LayoutDashboard,
  Building2,
  Sparkles,
  Zap,
  Tag,
  HelpCircle,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const pathname = usePathname();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isReservarPage = pathname === "/reservar";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 py-2.5">
          
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="relative h-8 sm:h-9 w-28 sm:w-36 flex items-center">
              <Image
                src="/images/logo.svg"
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
            {!isReservarPage && (
              <Link
                href="/reservar"
                className="bg-electric-600 active:bg-electric-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                Reservar
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 focus:outline-none transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Desplegable Móvil Moderno */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200/80 bg-white/98 backdrop-blur-2xl px-4 sm:px-6 py-5 shadow-2xl rounded-b-3xl space-y-4 animate-in slide-in-from-top-3 duration-200 max-h-[calc(100vh-75px)] overflow-y-auto">
          
          {/* Botón Principal de Reserva Móvil */}
          <Link
            href="/reservar"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between w-full p-3.5 bg-gradient-to-r from-electric-600 to-electric-700 hover:from-electric-700 hover:to-electric-800 text-white rounded-2xl shadow-lg shadow-electric-600/25 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">Reservar Servicio Online</p>
                <p className="text-[10px] text-electric-100 font-medium">Cotiza y agenda en 60 segundos</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/80 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Enlaces Principales con Iconos Estilizados */}
          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 px-2 mb-1">
              Explorar
            </p>

            <Link
              href="/#servicios"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-electric-50 text-electric-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>Servicios de Limpieza</span>
            </Link>

            <Link
              href="/#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span>Cómo Funciona</span>
            </Link>

            <Link
              href="/#precios"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <span>Planes & Tarifas</span>
            </Link>

            <Link
              href="/corporativo"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <span>Corporativo & Oficinas</span>
                <span className="text-[9px] font-extrabold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">
                  B2B
                </span>
              </div>
            </Link>

            <Link
              href="/preguntas-frecuentes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <span>Preguntas Frecuentes</span>
            </Link>
          </div>

          {/* Botón Directo WhatsApp */}
          <a
            href="https://wa.me/595984320528"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-emerald-50/80 hover:bg-emerald-100/70 text-emerald-900 rounded-2xl text-xs font-bold border border-emerald-200 shadow-2xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.996.586 3.86 1.6 5.432L2 22l4.71-1.543c1.517.917 3.292 1.443 5.188 1.443 5.535 0 10.031-4.496 10.031-10.031C21.929 6.496 17.566 2 12.031 2zm0 18.33c-1.636 0-3.18-.46-4.512-1.266l-.323-.194-3.13.826.837-3.05-.21-.334A8.257 8.257 0 013.731 12.03c0-4.577 3.723-8.3 8.3-8.3 4.577 0 8.3 3.723 8.3 8.3 0 4.577-3.723 8.3-8.3 8.3zm4.55-6.22c-.25-.125-1.477-.73-1.706-.813-.23-.083-.396-.125-.563.125-.166.25-.646.813-.792.98-.146.166-.292.187-.542.062s-1.056-.39-2.012-1.242c-.744-.664-1.246-1.485-1.392-1.735-.146-.25-.015-.385.11-.51.112-.112.25-.292.375-.438.125-.146.167-.25.25-.417.083-.166.042-.312-.02-.437-.063-.125-.563-1.355-.772-1.855-.203-.487-.41-.421-.563-.429l-.479-.008c-.167 0-.438.063-.667.313-.23.25-.875.854-.875 2.083 0 1.229.896 2.417 1.021 2.583.125.167 1.764 2.694 4.274 3.777.597.258 1.064.412 1.428.528.6.191 1.146.164 1.577.1.48-.072 1.477-.604 1.685-1.188.209-.583.209-1.083.146-1.188-.062-.104-.229-.166-.479-.291z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">Atención por WhatsApp</p>
                <p className="text-[10px] text-emerald-700 font-medium">(0984) 320-528</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
              Online
            </span>
          </a>

          {/* Sección de Cuenta y Autenticación */}
          <div className="pt-2 border-t border-neutral-100 space-y-3">
            {session?.user ? (
              <div className="bg-neutral-50/90 p-3.5 rounded-2xl border border-neutral-200 space-y-2.5">
                {/* Perfil Header */}
                <div className="flex items-center gap-3 pb-2.5 border-b border-neutral-200/80">
                  <span className="w-9 h-9 rounded-xl bg-electric-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {session.user.name?.charAt(0) || "U"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-neutral-900 truncate">{session.user.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{session.user.email}</p>
                  </div>
                  {isAdmin ? (
                    <span className="px-2 py-0.5 bg-electric-600 text-white text-[9px] font-extrabold rounded-md shadow-2xs">
                      ADMIN
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold rounded-md">
                      CLIENTE
                    </span>
                  )}
                </div>

                {/* Acciones de Usuario */}
                <div className="space-y-1">
                  <Link
                    href="/portal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-2 px-2.5 text-xs font-semibold text-neutral-800 hover:text-electric-700 hover:bg-white rounded-xl transition-all"
                  >
                    <Calendar className="w-4 h-4 text-electric-600" />
                    <span>Mis Reservas & Direcciones</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 py-2 px-2.5 text-xs font-bold text-neutral-900 hover:text-electric-700 hover:bg-white rounded-xl transition-all"
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
                    className="flex items-center gap-2.5 w-full text-left py-2 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Botón Iniciar Sesión con Google */}
                <GoogleSignInButton
                  callbackUrl="/portal"
                  text="Continuar con Google"
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2.5 bg-neutral-100 hover:bg-neutral-200/80 active:bg-neutral-200 rounded-xl text-neutral-800 font-bold text-xs transition-colors"
                  >
                    Iniciar Sesión
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2.5 bg-electric-50 hover:bg-electric-100/80 border border-electric-200 rounded-xl text-electric-700 font-bold text-xs transition-colors"
                  >
                    Crear Cuenta
                  </Link>
                </div>
              </div>
            )}

            {/* Garantía y Seguridad */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-medium pt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Personal con IPS verificado • Garantía 200%</span>
            </div>
          </div>

        </div>
      )}
    </header>
  );
}
