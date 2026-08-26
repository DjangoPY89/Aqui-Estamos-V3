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
  return (
    <main>
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
