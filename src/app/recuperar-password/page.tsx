"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  ShieldCheck
} from "lucide-react";

function RecuperarPasswordContent() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || "";
  const initialEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<"REQUEST" | "RESET" | "SUCCESS">(
    initialToken ? "RESET" : "REQUEST"
  );

  const [email, setEmail] = useState(initialEmail);
  const [tokenOrCode, setTokenOrCode] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialToken) {
      setTokenOrCode(initialToken);
      setStep("RESET");
    }
  }, [initialToken]);

  // Paso 1: Solicitar código / enlace de recuperación
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al enviar solicitud.");
      }

      setSuccessNotice("Te hemos enviado un código y enlace a tu correo. Revisa también tu carpeta de spam.");
      setStep("RESET");
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Restablecer contraseña con código/token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!tokenOrCode.trim()) {
      setErrorMsg("Por favor ingresa el código de 6 dígitos recibido por correo.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenOrCode: tokenOrCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al restablecer contraseña.");
      }

      setStep("SUCCESS");
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar el cambio de contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-neutral-50 via-white to-electric-50/20 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Elementos Decorativos */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <div className="relative h-12 w-48 mx-auto">
              <Image
                src="/images/logo.jpeg"
                alt="Aquí Estamos Limpieza"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="mt-3 text-2xl font-black text-neutral-900 tracking-tight">
            {step === "SUCCESS"
              ? "¡Contraseña Actualizada!"
              : step === "RESET"
              ? "Crear Nueva Contraseña"
              : "Recuperar Contraseña"}
          </h1>
          <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
            {step === "SUCCESS"
              ? "Tu cuenta ha sido protegida y tu nueva clave ya está activa."
              : step === "RESET"
              ? "Introduce el código recibido por correo y tu nueva clave."
              : "Ingresa tu correo para recibir un enlace y código de restablecimiento seguro."}
          </p>
        </div>

        {/* Tarjeta de Recuperación */}
        <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xl shadow-neutral-200/50 space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && step !== "SUCCESS" && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* PASO 1: Formulario para solicitar código */}
          {step === "REQUEST" && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Correo Electrónico de tu Cuenta
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Enviar Código de Recuperación</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep("RESET")}
                  className="text-xs text-neutral-500 hover:text-neutral-800 underline font-medium"
                >
                  ¿Ya tienes un código de 6 dígitos? Haz clic aquí
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: Formulario para ingresar código y nueva clave */}
          {step === "RESET" && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Código de 6 Dígitos o Token
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={tokenOrCode}
                    onChange={(e) => setTokenOrCode(e.target.value)}
                    placeholder="Ej: 849201"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono font-bold text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Nueva Contraseña (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Guardar Nueva Contraseña</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setStep("REQUEST")}
                  className="text-xs text-neutral-500 hover:text-neutral-800 underline font-medium"
                >
                  ← Solicitar otro código
                </button>
              </div>
            </form>
          )}

          {/* PASO 3: Éxito */}
          {step === "SUCCESS" && (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Tu contraseña ha sido actualizada exitosamente. Ahora puedes ingresar a tu cuenta con tu nueva clave.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="block w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric text-center transition-all"
                >
                  Ir a Iniciar Sesión
                </Link>
              </div>
            </div>
          )}

          {/* Volver a Login */}
          <div className="text-center pt-2 border-t border-neutral-100">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Inicio de Sesión</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function RecuperarPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs text-neutral-400">Cargando...</div>}>
      <RecuperarPasswordContent />
    </Suspense>
  );
}
