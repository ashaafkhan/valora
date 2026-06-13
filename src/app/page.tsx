import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { LandingClient } from "@/components/landing/LandingClient";

export default async function Home() {
  const session = await auth();

  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingDone: true },
    });

    if (user?.onboardingDone) {
      redirect("/inbox");
    } else {
      redirect("/onboarding");
    }
  }

  return (
    <main className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      <AnimatedBackground />
      <LandingNav />
      <Hero />
      <Stats />
      <Features />

      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Ready to take back your inbox?
          </h2>
          <p className="text-text-secondary mb-8">
            Connect in 30 seconds. No credit card required.
          </p>
          <a
            href="/login"
            className="btn-shimmer inline-flex items-center gap-2 bg-primary text-white font-semibold
                       px-10 py-4 rounded-2xl text-lg shadow-[0_0_40px_rgba(124,58,237,0.5)]
                       hover:shadow-[0_0_60px_rgba(124,58,237,0.7)] hover:-translate-y-1
                       transition-all duration-200"
          >
            Get Started Free
          </a>
        </div>
      </section>

      <Footer />
      <LandingClient />
    </main>
  );
}
