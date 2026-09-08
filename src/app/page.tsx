import React from "react";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import HowItWorks from "@/components/home/HowItWorks";
import ServicesGrid from "@/components/home/ServicesGrid";
import RoomChecklist from "@/components/home/RoomChecklist";
import QuickCalculator from "@/components/home/QuickCalculator";
import CleanersTrust from "@/components/home/CleanersTrust";
import AboutSection from "@/components/home/AboutSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CorporateTeaser from "@/components/home/CorporateTeaser";
import CoverageMap from "@/components/home/CoverageMap";
import Testimonials from "@/components/home/Testimonials";
import GuaranteeBanner from "@/components/home/GuaranteeBanner";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService", "CleaningService"],
    "name": "Aquí Estamos - Empresa de Limpieza en Asunción y Paraguay",
    "alternateName": [
      "Aquí Estamos Limpieza",
      "Empresa de Limpieza en Paraguay",
      "Empresa de Limpieza Asunción",
      "La Mejor Empresa de Limpieza en Paraguay",
      "La Mejor Empresa de Limpieza en Asunción",
      "El Mejor Empresa de Limpieza",
      "Servicio de Limpieza a Domicilio Aquí Estamos"
    ],
    "description": "Aquí Estamos es la mejor empresa de limpieza en Paraguay y Asunción. Servicio de limpieza a domicilio, casas, departamentos, oficinas y empresas con personal calificado e inscripto formalmente en IPS.",
    "url": "https://aqui-estamos-v3.vercel.app",
    "telephone": "+595984320528",
    "priceRange": "155.000 Gs. - 255.000 Gs.",
    "image": "https://aqui-estamos-v3.vercel.app/images/limpieza-casas-departamentos-asuncion-paraguay.jpg",
    "logo": "https://aqui-estamos-v3.vercel.app/images/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Villa Morra",
      "addressLocality": "Asunción",
      "addressRegion": "Central",
      "addressCountry": "PY"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -25.2831,
      "longitude": -57.5612
    },
    "areaServed": [
      { "@type": "City", "name": "Asunción" },
      { "@type": "City", "name": "Luque" },
      { "@type": "City", "name": "San Lorenzo" },
      { "@type": "City", "name": "Lambaré" },
      { "@type": "City", "name": "Fernando de la Mora" },
      { "@type": "City", "name": "Mariano Roque Alonso" },
      { "@type": "Country", "name": "Paraguay" }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "08:00",
        "closes": "20:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "keywords": [
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
      "empresa de limpieza el mejor",
      "el mejor empresa de limpieza",
      "la mejor empresa de limpieza",
      "la mejor empresa de limpieza en paraguay",
      "la mejor empresa de limpieza en asuncion",
      "servicio de limpieza por horas",
      "limpieza de casas asuncion",
      "limpieza de oficinas paraguay"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Servicios de Limpieza por Horas",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Servicio de Limpieza Express (4 Horas)",
            "description": "Limpieza a domicilio para departamentos y espacios de 1-2 ambientes en Asunción."
          },
          "price": "155000",
          "priceCurrency": "PYG"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Servicio de Limpieza Integral (6 Horas)",
            "description": "Limpieza profunda a domicilio para casas de 2 a 3 habitaciones en Asunción y Gran Asunción."
          },
          "price": "210000",
          "priceCurrency": "PYG"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Servicio de Limpieza Full Day (8 Horas)",
            "description": "Jornada completa de limpieza profunda para residencias amplias, mudanzas y oficinas en Paraguay."
          },
          "price": "255000",
          "priceCurrency": "PYG"
        }
      ]
    }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <ServicesGrid />
      <RoomChecklist />
      <QuickCalculator />
      <CleanersTrust />
      <AboutSection />
      <WhyChooseUs />
      <CorporateTeaser />
      <CoverageMap />
      <Testimonials />
      <GuaranteeBanner />
    </main>
  );
}
