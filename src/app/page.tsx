import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { InboxFeature } from "@/components/landing/InboxFeature";
import { Features } from "@/components/landing/Features";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { CalendarFeature } from "@/components/landing/CalendarFeature";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[var(--background)] overflow-x-hidden">
      {/* Sticky Navigation */}
      <LandingNav />

      {/* 1. Hero — "Gmail. Calendar. One Brain." */}
      <Hero />

      {/* 3. Inbox Feature — "Your inbox answers back." */}
      <InboxFeature />

      {/* 4. Feature Bento — "Full Gmail control. Zero compromise." */}
      <Features />

      {/* 5. Metrics — "Every metric at a glance." */}
      <MetricsSection />

      {/* 6. Calendar — "Your schedule, always in view." */}
      <CalendarFeature />

      {/* 7. How It Works — "Built for how you actually work." */}
      <HowItWorks />

      {/* 8. Pricing — "Simple, transparent pricing." */}
      <Pricing />

      {/* 10. Footer */}
      <Footer />
    </main>
  );
}
