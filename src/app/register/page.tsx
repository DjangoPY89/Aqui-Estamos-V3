"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  LogIn
} from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPhone = formData.phone.trim();

    if (!cleanName || !cleanEmail || !formData.password) {
      setErrorMsg("Nombre, correo y contraseña son obligatorios.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Crear el usuario en la base de datos
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          password: formData.password,
        }),
      });

      let data: any = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: "Ocurrió un error al procesar el registro." };
      }

      if (!res.ok) {
        throw new Error(data.error || "Error al crear la cuenta.");
      }

      // 2. Iniciar sesión automáticamente tras el registro
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: cleanEmail,
        password: formData.password,
        callbackUrl: "/portal",
      });

      if (loginRes?.ok && !loginRes?.error) {
        window.location.href = "/portal";
      } else {
        window.location.href = "/login?registered=true";
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al registrarse.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-neutral-50 via-white to-electric-50/20 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Elementos Decorativos de Fondo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4 relative z-10">
        <Link href="/" className="inline-block mb-5 transition-transform hover:scale-105">
          <div className="relative h-11 w-48 mx-auto">
            <Image
              src="/images/logo.jpeg"
              alt="Aquí Estamos Limpieza"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Crear tu Cuenta de Cliente
        </h1>
        <p className="mt-1.5 text-xs text-neutral-500 max-w-sm mx-auto">
          Únete a Aquí Estamos para reservar turnos online en 60 segundos y gestionar tus servicios.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-8 rounded-3xl border border-neutral-200 shadow-xl shadow-neutral-200/50 space-y-5">
          
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botón Oficial Google */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <GoogleSignInButton
                callbackUrl="/portal"
                onError={(err) => setErrorMsg(err)}
                text="Registrarse con Google"
              />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                o completa tus datos
              </span>
              <div className="border-t border-neutral-200 w-full" />
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Nombre Completo *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: María Benítez"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="maria@ejemplo.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">WhatsApp / Teléfono</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0981 123 456"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Contraseña (Mín. 6 caracteres) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-electric-600 focus:border-electric-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-neutral-400 hover:text-neutral-600 p-0.5"
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-electric-600 hover:bg-electric-700 text-white font-bold text-xs rounded-xl shadow-electric transition-all active:scale-[0.98] disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Crear mi Cuenta Gratis</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-neutral-500 pt-3 border-t border-neutral-100 flex items-center justify-center gap-1.5">
            <span>¿Ya tienes cuenta?</span>
            <Link href="/login" className="font-bold text-electric-600 hover:text-electric-700 hover:underline flex items-center gap-1">
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
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
