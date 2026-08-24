"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { signIn } from "next-auth/react";

interface GoogleSignInButtonProps {
  callbackUrl?: string;
  onError?: (msg: string) => void;
  text?: string;
}

declare global {
  interface Window {
    google?: any;
    handleGoogleCredentialResponse?: (response: any) => void;
  }
}

export default function GoogleSignInButton({
  callbackUrl = "/portal",
  onError,
  text = "Continuar con Google",
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Callback para Google Identity Services (GIS Token)
  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      if (onError) onError("No se recibió credencial de Google.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        isGoogleToken: "true",
        googleToken: response.credential,
        callbackUrl,
      });

      if (res?.error) {
        if (onError) onError(res.error);
        setIsLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      console.error("Error en autenticación Google GIS:", err);
      if (onError) onError("Error al validar sesión de Google.");
      setIsLoading(false);
    }
  };

  // Inicializar Google One Tap y SDK si hay Client ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.handleGoogleCredentialResponse = handleCredentialResponse;
    }

    if (gisLoaded && window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Intentar One Tap discretamente en escritorio
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap omitido, el botón manual sigue activo
          }
        });
      } catch (e) {
        console.warn("Google GIS init prompt:", e);
      }
    }
  }, [gisLoaded, clientId]);

  // Manejo del clic en el botón: Directo a Google OAuth 2.0 oficial con redirección nativa
  const handleGoogleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. Redirección oficial OAuth de Google estándar
      const targetUrl = callbackUrl || "/portal";
      await signIn("google", {
        callbackUrl: targetUrl,
        redirect: true,
      });
    } catch (err: any) {
      console.warn("Error en signIn google:", err);
      // Si el framework del cliente no redirige de inmediato, forzar navegación directa
      window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl || "/portal")}`;
    }
  };

  return (
    <>
      {/* Script oficial de Google Identity Services (GIS SDK) */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={() => setGisLoaded(true)}
      />

      <div className="w-full">
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isLoading}
          className="group relative w-full h-12 px-4 py-2.5 bg-white hover:bg-neutral-50/90 active:bg-neutral-100 text-neutral-800 border border-neutral-300 hover:border-neutral-400/80 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.99]"
          title="Iniciar sesión de forma rápida y segura con tu cuenta de Google"
        >
          {/* Logo Oficial de Google SVG Multicolor */}
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-electric-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
          </div>

          {/* Texto Principal */}
          <span className="flex-1 text-center text-sm font-semibold text-neutral-800 tracking-tight">
            {isLoading ? "Conectando con Google..." : text}
          </span>

          {/* Badge o Flecha decorativa */}
          <div className="shrink-0">
            <span className="text-[10px] font-extrabold text-neutral-500 bg-neutral-100 group-hover:bg-electric-50 group-hover:text-electric-700 px-2 py-0.5 rounded-md border border-neutral-200 transition-colors">
              1 Clic
            </span>
          </div>
        </button>
      </div>
    </>
  );
}
