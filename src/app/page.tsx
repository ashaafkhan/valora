import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import {
  Inbox,
  Calendar,
  Sparkles,
  Command,
  ArrowRight,
  Zap,
  Lock,
  Mail,
  ShieldAlert,
} from "lucide-react";

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
    <main className="min-h-screen bg-[#050505] text-[#F8F8F8] font-sans antialiased selection:bg-[#7C3AED] selection:text-white pb-16">
      {/* Decorative grid pattern in background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center justify-between border-[3px] border-zinc-100 bg-[#0A0A0A] p-4 shadow-[4px_4px_0px_0px_#7C3AED]">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-white bg-[#7C3AED] px-2 py-1 border-2 border-zinc-100 shadow-[2px_2px_0px_0px_#FFF]">
              V 1.0
            </span>
            <span className="font-mono font-black text-xl tracking-wider text-white">
              VALORA
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="font-mono text-sm hover:text-[#7C3AED] transition-colors">
              [ FEATURES ]
            </a>
            <a href="#security" className="font-mono text-sm hover:text-[#7C3AED] transition-colors">
              [ DATA POLICY ]
            </a>
            <Link href="/privacy" className="font-mono text-sm hover:text-[#7C3AED] transition-colors">
              [ PRIVACY ]
            </Link>
          </nav>
          <Link
            href="/login"
            className="font-mono text-xs md:text-sm font-bold bg-[#F8F8F8] text-black px-4 py-2 border-[2px] border-black shadow-[3px_3px_0px_0px_#7C3AED] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#7C3AED] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_#7C3AED] transition-all"
          >
            LAUNCH APP
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-block border-[3px] border-[#7C3AED] bg-[#111111] px-4 py-1.5 mb-6 shadow-[3px_3px_0px_0px_#FFF]">
          <p className="font-mono text-xs md:text-sm font-bold text-[#C4B5FD] flex items-center gap-2">
            <Zap className="w-4 h-4 fill-current animate-pulse text-[#C4B5FD]" />
            THE AI-FIRST COMMAND CENTER
          </p>
        </div>

        <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-none mb-6 text-white max-w-5xl mx-auto">
          COMMAND YOUR INBOX.<br />
          <span className="text-[#7C3AED] border-b-[6px] border-[#7C3AED]">OWN YOUR TIME.</span>
        </h1>

        <p className="text-base md:text-xl font-mono text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          An AI-native dashboard for Gmail and Calendar. Designed for rapid inbox processing, context-aware scheduling, and zero friction.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/login"
            className="w-full sm:w-auto font-mono text-lg font-black bg-[#7C3AED] text-white px-8 py-4 border-[3px] border-zinc-100 shadow-[6px_6px_0px_0px_#FFF] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#FFF] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_#FFF] transition-all flex items-center justify-center gap-3"
          >
            GET STARTED NOW
            <ArrowRight className="w-5 h-5 text-white" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto font-mono text-lg font-bold bg-[#111111] text-zinc-300 px-8 py-4 border-[3px] border-zinc-700 shadow-[6px_6px_0px_0px_#333] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#333] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_#333] transition-all flex items-center justify-center"
          >
            [ EXPLAIN APP ]
          </a>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-10 text-center md:text-left">
          ⚡ KEY CAPABILITIES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="border-[3px] border-zinc-100 bg-[#0A0A0A] p-6 shadow-[6px_6px_0px_0px_#7C3AED] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#7C3AED] transition-all duration-200">
            <div className="w-12 h-12 bg-[#7C3AED] border-2 border-zinc-100 flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_#FFF]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-mono text-lg font-bold text-white uppercase mb-2">
              AI Priority Engine
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Automatically scores incoming emails from 0 to 100 based on urgency and context. Built-in integration with Groq (llama-3.3-70b-versatile) surfaces critical action items instantly without sharing your private data with third-party aggregators.
            </p>
          </div>

          {/* Card 2 */}
          <div className="border-[3px] border-zinc-100 bg-[#0A0A0A] p-6 shadow-[6px_6px_0px_0px_#22C55E] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#22C55E] transition-all duration-200">
            <div className="w-12 h-12 bg-[#22C55E] border-2 border-zinc-100 flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_#FFF]">
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-mono text-lg font-bold text-white uppercase mb-2">
              Gmail & Calendar Sync
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Powered by Corsair SDK integrations. Read, search, write, and organize your inbox directly from a unified dashboard. Instantly schedule meetings, update calendars, and manage reminders in real-time.
            </p>
          </div>

          {/* Card 3 */}
          <div className="border-[3px] border-zinc-100 bg-[#0A0A0A] p-6 shadow-[6px_6px_0px_0px_#EAB308] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#EAB308] transition-all duration-200">
            <div className="w-12 h-12 bg-[#EAB308] border-2 border-zinc-100 flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_#FFF]">
              <Command className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-mono text-lg font-bold text-white uppercase mb-2">
              Keyboard-First Command Bar
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Search your inbox, trigger rules, command the AI assistant, or navigate folders using intuitive keyboard shortcuts. Zero mouse interaction required. Sub-100ms response time on key operations.
            </p>
          </div>

          {/* Card 4 */}
          <div className="border-[3px] border-zinc-100 bg-[#0A0A0A] p-6 shadow-[6px_6px_0px_0px_#A855F7] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#A855F7] transition-all duration-200">
            <div className="w-12 h-12 bg-[#A855F7] border-2 border-zinc-100 flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_#FFF]">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-mono text-lg font-bold text-white uppercase mb-2">
              Interactive AI Assistant
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Chat directly with your email agent. Ask it to &quot;draft a polite decline to this meeting&quot;, &quot;summarize my unread thread with Alex&quot;, or &quot;find calendar slots next week&quot;. Empowered with category-specific persistent memory.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Data Scope Policy Section */}
      <section id="security" className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="border-[3px] border-zinc-100 bg-[#0A0A0A] p-8 shadow-[6px_6px_0px_0px_#EF4444]">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-[#EF4444]" />
            <h2 className="font-mono text-xl font-black text-white uppercase">
              DATA PRIVACY & OAUTH USE POLICY
            </h2>
          </div>

          <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6">
            Valora request Google API scopes (via Google OAuth) exclusively to manage your inbox and schedule. We implement the highest grade of data protection and privacy:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="border-2 border-zinc-800 p-4 bg-[#111111]">
              <h4 className="font-mono text-xs font-bold text-[#EF4444] mb-2 uppercase flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Gmail Scopes
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Used to display your messages, parse thread details for priority scoring, and send email drafts you explicitly write or request.
              </p>
            </div>
            <div className="border-2 border-zinc-800 p-4 bg-[#111111]">
              <h4 className="font-mono text-xs font-bold text-[#EF4444] mb-2 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Calendar Scopes
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Used to read calendar events, check your availability, and create scheduled calendar invites at your direct request.
              </p>
            </div>
            <div className="border-2 border-zinc-800 p-4 bg-[#111111]">
              <h4 className="font-mono text-xs font-bold text-[#EF4444] mb-2 uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                No Selling / Sharing
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We do not sell, monetize, or lease your Google account data to advertisers or third-party aggregators. All access is direct and encrypted.
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-500 font-mono">
            Read our full [Privacy Policy](/privacy) and [Terms of Service](/terms) to learn how we utilize encryptions (AES-256 for tokens) to keep your account safe. You can revoke permissions at any time through Google Account Settings.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto px-6 mt-12 pt-8 border-t-2 border-zinc-800 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-mono text-xs text-zinc-500">
          © {new Date().getFullYear()} VALORA (valorahq.in) · ALL RIGHTS RESERVED.
        </p>
        <div className="flex items-center space-x-6">
          <Link href="/privacy" className="font-mono text-xs text-zinc-400 hover:text-white transition-colors">
            PRIVACY POLICY
          </Link>
          <Link href="/terms" className="font-mono text-xs text-zinc-400 hover:text-white transition-colors">
            TERMS OF SERVICE
          </Link>
        </div>
      </footer>
    </main>
  );
}

