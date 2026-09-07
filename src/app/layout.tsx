import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://aqui-estamos-v3.vercel.app"),
  title: "Aquí Estamos | Servicios Profesionales de Limpieza en Asunción",
  description: "Limpieza profesional de casas, departamentos y oficinas en Asunción y Gran Asunción. Reserva tu servicio por horas en 60 segundos con personal verificado bajo IPS y garantía 200%.",
  keywords: [
    "limpieza en asuncion",
    "servicios de limpieza paraguay",
    "limpieza de casas por hora",
    "limpieza de departamentos",
    "limpieza profunda de baños",
    "personal de limpieza ips paraguay",
    "aqui estamos limpieza",
  ],
  icons: {
    icon: "/images/favicon.png",
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
  openGraph: {
    title: "Aquí Estamos | Servicios Profesionales de Limpieza en Asunción",
    description: "Reserva tu limpieza de hogar en 60 segundos con personal contratado bajo IPS. Garantía de satisfacción total en Asunción y Gran Asunción.",
    url: "https://aqui-estamos-v3.vercel.app",
    siteName: "Aquí Estamos Limpieza",
    images: [
      {
        url: "/images/hero-bathroom-render.jpg",
        width: 1600,
        height: 1067,
        alt: "Servicios Profesionales de Limpieza de Hogar en Asunción - Aquí Estamos",
      },
      {
        url: "/images/logo.png",
        width: 800,
        height: 600,
        alt: "Logo Aquí Estamos Limpieza Paraguay",
      },
    ],
    locale: "es_PY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aquí Estamos | Limpieza Profesional en Asunción",
    description: "Servicios de limpieza por horas con personal verificado en Asunción y Gran Asunción.",
    images: ["/images/hero-bathroom-render.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased bg-slate-50 text-slate-900 font-sans">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <WhatsAppFloat />
        </AuthProvider>
      </body>
    </html>
  );
}
