import React from 'react';
import HeroSection from "@/Components/Landing/HeroSection";
import TrustIndicators from "@/Components/Landing/TrustIndicators";
import HowItWorks from "@/Components/Landing/HowItWorks";
import InvestmentCategories from "@/Components/Landing/InvestmentCategories";
import SecuritySection from "@/Components/Landing/SecuritySection";
import CTASection from "@/Components/Landing/CTASection";
import Footer from "@/Components/Landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustIndicators />
      <HowItWorks />
      <InvestmentCategories />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}
