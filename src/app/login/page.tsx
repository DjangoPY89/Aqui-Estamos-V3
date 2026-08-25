"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  User as UserIcon,
  Phone,
  UserPlus,
  LogIn
} from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/portal";
  const wasRegistered = searchParams.get("registered") === "true";

  // Si entra con tab=register, redirigir inmediatamente a /register
  React.useEffect(() => {
    if (searchParams.get("tab") === "register") {
      window.location.href = `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    }
  }, [searchParams, callbackUrl]);

  // Estados para Iniciar Sesión
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(
    wasRegistered ? "¡Cuenta creada con éxito! Ingresa con tus credenciales a continuación." : null
  );

  // Manejo de Inicio de Sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const targetEmail = loginEmail.trim().toLowerCase();

      const res = await signIn("credentials", {
        redirect: false,
        email: targetEmail,
        password: loginPassword,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin" || res.error.includes("CredentialsSignin")) {
          setErrorMsg("Correo o contraseña incorrectos. Por favor verifica tus datos.");
        } else {
          setErrorMsg(res.error);
        }
        setIsLoading(false);
      } else {
        // Redirigir a panel de administración si es admin, o al portal del cliente
        if (targetEmail === "juanas89@gmail.com" || targetEmail === "admin@aquiestamos.com") {
          window.location.href = "/admin";
        } else {
          window.location.href = callbackUrl;
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al conectar con el servidor.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-gradient-to-b from-neutral-50 via-white to-electric-50/20 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Elementos Decorativos de Fondo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Contenedor Central */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Logo & Marca */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <div className="relative h-12 w-48 mx-auto">
              <Image
                src="/images/logo.svg"
                alt="Aquí Estamos Limpieza"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
            Ingresa a tu cuenta para gestionar tus reservas y ver a tu personal asignado.
          </p>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xl shadow-neutral-200/50 space-y-5">
          
          {/* Mensaje de Éxito */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mensaje de Error */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Selector de Pestaña: Iniciar Sesión vs Regístrate (Enlace directo a /register) */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
            <div className="flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 bg-white text-neutral-900 shadow-xs cursor-default">
              <LogIn className="w-3.5 h-3.5 text-electric-600" />
              <span>Iniciar Sesión</span>
            </div>

            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-white/60"
            >
              <UserPlus className="w-3.5 h-3.5 text-neutral-400" />
              <span>Registrarme</span>
            </Link>
          </div>

          {/* Botón de Google en 1 Clic */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <GoogleSignInButton
                callbackUrl={callbackUrl}
                onError={(err) => setErrorMsg(err)}
                text="Continuar con Google"
              />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                o con tu correo
              </span>
              <div className="border-t border-neutral-200 w-full" />
            </div>
          </div>

          {/* Formulario de Iniciar Sesión */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete="username"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Contraseña
                </label>
                <Link
                  href="/recuperar-password"
                  className="text-[11px] font-semibold text-electric-600 hover:text-electric-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-600 p-0.5"
                  title={showLoginPassword ? "Ocultar" : "Mostrar"}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-electric-600 rounded border-neutral-300 focus:ring-electric-500"
                />
                <span className="text-xs text-neutral-600 font-medium select-none">
                  Recordar mi sesión
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Ingresar a mi Cuenta</span>
                </>
              )}
            </button>
          </form>

          {/* Enlace inferior directo a registro */}
          <div className="text-center text-xs text-neutral-500 pt-3 border-t border-neutral-100">
            ¿No tienes cuenta aún?{" "}
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-bold text-electric-600 hover:text-electric-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Registrarme con Dirección y Mapa</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

        {/* Insignias de Confianza Inferiores */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Conexión Cifrada SSL</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-electric-600" />
            <span>Autenticación Segura</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <span>🇵🇾 Asunción, Paraguay</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs text-neutral-400">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
