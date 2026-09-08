import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://aqui-estamos-v3.vercel.app"),
  title: {
    default: "Aquí Estamos | Empresa de Limpieza en Asunción y Paraguay",
    template: "%s | Aquí Estamos Limpieza Paraguay",
  },
  description: "Aquí Estamos es la empresa de limpieza líder en Paraguay y Asunción. Servicio de limpieza a domicilio, casas y oficinas por horas con personal asegurado en IPS y garantía 200%.",
  keywords: [
    "empresa de limpieza",
    "empresas de limpieza en paraguay",
    "servicio de limpieza a domicilio",
    "empresa de limpieza en paraguay",
    "servicio de limpieza",
    "empresas de limpiezas en paraguay",
    "empresa de limpieza asuncion",
    "empresa de limpieza en asuncion",
    "empresas de limpieza en asuncion",
    "empresas de limpieza asuncion",
    "servicio de limpieza paraguay",
    "limpieza por horas asuncion",
    "limpieza de casas asuncion",
    "limpieza de oficinas asuncion",
    "limpieza departamentos paraguay"
  ],
  authors: [{ name: "Aquí Estamos Limpieza", url: "https://aqui-estamos-v3.vercel.app" }],
  creator: "Aquí Estamos",
  publisher: "Aquí Estamos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/favicon.png",
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
  openGraph: {
    title: "Aquí Estamos | Empresa de Limpieza en Asunción y Paraguay",
    description: "Servicio de limpieza a domicilio, oficinas y empresas en Asunción y Gran Asunción Paraguay. Reserva online en 60 segundos con tarifa plana y garantía total.",
    url: "https://aqui-estamos-v3.vercel.app",
    siteName: "Aquí Estamos Limpieza",
    images: [
      {
        url: "/images/limpieza-casas-departamentos-asuncion-paraguay.jpg",
        width: 1200,
        height: 630,
        alt: "Aquí Estamos - Empresa de Limpieza en Asunción Paraguay",
      },
    ],
    locale: "es_PY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aquí Estamos | Empresa de Limpieza en Asunción y Paraguay",
    description: "Servicio de limpieza a domicilio en Asunción y Gran Asunción con personal calificado en IPS.",
    images: ["/images/limpieza-casas-departamentos-asuncion-paraguay.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
