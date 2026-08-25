import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import AuthProvider from "@/components/providers/AuthProvider";
import { PageVisitTracker } from "@/components/analytics/PageVisitTracker";

export const metadata: Metadata = {
  title: "Aquí Estamos | Servicios Profesionales de Limpieza en Asunción",
  description: "Limpieza profesional de casas y oficinas en Asunción y Gran Asunción. Reserva tu limpieza estándar, profunda o de mudanza en 60 segundos con personal verificado y garantía 200%.",
  icons: {
    icon: "/images/favicon.jpeg",
    shortcut: "/images/favicon.jpeg",
    apple: "/images/favicon.jpeg",
  },
  openGraph: {
    title: "Aquí Estamos | Limpieza Profesional en Asunción",
    description: "Reserva tu limpieza de hogar en 60 segundos. Garantía de satisfacción total en Asunción y Gran Asunción.",
    images: ["/images/favicon.jpeg"],
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
          <PageVisitTracker />
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
