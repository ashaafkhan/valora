import { redirect } from "next/navigation";
import { Mail, Calendar, CheckCircle2, Shield, Keyboard, Sparkles, ArrowRight } from "lucide-react";
import { auth } from "@/server/auth";
import { corsair } from "@/server/corsair";
import { generateOAuthUrl } from "corsair/oauth";
import { db } from "@/server/db";

// Server Action to generate OAuth link for Corsair
async function getOAuthUrl(pluginId: string, userId: string) {
  "use server";
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/corsair/callback`;
  const result = await generateOAuthUrl(corsair, pluginId, {
    tenantId: userId,
    redirectUri,
  });
  return result.url;
}

// Server Action to complete onboarding and save preferences
async function completeOnboarding(userId: string, formData: FormData) {
  "use server";
  const enableAI = formData.get("enableAI") === "true";
  const enableShield = formData.get("enableShield") === "true";
  const enableShortcuts = formData.get("enableShortcuts") === "true";

  await db.user.update({
    where: { id: userId },
    data: {
      onboardingDone: true,
      preferences: {
        enableAI,
        enableShield,
        enableShortcuts,
      },
    },
  });

  redirect("/inbox");
}

interface PageProps {
  searchParams: Promise<{
    success?: string;
    plugin?: string;
    error?: string;
  }>;
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const status = await corsair.manage.connectionStatus.get({ tenantId: userId });

  const hasGmail = status.gmail === "connected";
  const hasCalendar = status.googlecalendar === "connected";

  // Determine current step
  let currentStep = 1;
  if (hasGmail && !hasCalendar) {
    currentStep = 2;
  } else if (hasGmail && hasCalendar) {
    currentStep = 3;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] text-[#F8F8F8] p-6 relative">
      {/* Premium Glassmorphic Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7C3AED]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#111111]/80 backdrop-blur-xl border border-[#222222] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Accent Top Border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent" />

        {/* Header and Step Indicator */}
        <div className="flex justify-between items-center mb-8 border-b border-[#222222] pb-6">
          <div>
            <h1 className="text-xl font-bold font-sans text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#7C3AED]" />
              Welcome to Valora
            </h1>
            <p className="text-zinc-400 text-xs mt-1">
              Let's set up your premium workspace.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentStep >= 1 ? "bg-[#7C3AED]" : "bg-zinc-800"}`} />
            <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentStep >= 2 ? "bg-[#7C3AED]" : "bg-zinc-800"}`} />
            <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentStep >= 3 ? "bg-[#7C3AED]" : "bg-zinc-800"}`} />
          </div>
        </div>

        {/* Error Notification */}
        {params.error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
            <span className="font-semibold">Connection failed:</span> {params.error}
          </div>
        )}

        {/* Step 1: Connect Gmail */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Step 1: Connect Gmail</h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Valora syncs your emails locally, applies AI priority scoring, and enables fast semantic search.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400 space-y-2">
              <p className="font-semibold text-zinc-300">Required Permissions:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Read your messages and metadata</li>
                <li>Send and compose emails on your behalf</li>
                <li>Modify labels (Archive, Star, Read status)</li>
              </ul>
            </div>

            <form action={async () => {
              "use server";
              const url = await getOAuthUrl("gmail", userId);
              redirect(url);
            }}>
              <button className="w-full py-3.5 px-5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#7C3AED]/20">
                Connect Gmail <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Connect Calendar */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Step 2: Connect Google Calendar</h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Connect your calendar to view schedules, manage meetings, and use natural-language quick scheduling.
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Gmail integration connected successfully!</span>
            </div>

            <form action={async () => {
              "use server";
              const url = await getOAuthUrl("googlecalendar", userId);
              redirect(url);
            }}>
              <button className="w-full py-3.5 px-5 bg-white hover:bg-zinc-100 text-black font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                Connect Google Calendar <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Personalize */}
        {currentStep === 3 && (
          <form action={completeOnboarding.bind(null, userId)} className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-white">Step 3: Personalize Valora</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Choose which features you want to activate for your command center.
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1 */}
              <label className="flex items-start gap-4 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition">
                <input
                  type="checkbox"
                  name="enableAI"
                  value="true"
                  defaultChecked
                  className="mt-1 accent-[#7C3AED] w-4 h-4 rounded border-zinc-800"
                />
                <div>
                  <span className="font-semibold text-zinc-100 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                    Enable AI Priority Inbox
                  </span>
                  <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                    Uses Groq Llama-3 to automatically tag emails with priority levels (Urgent, High, Normal, Low).
                  </p>
                </div>
              </label>

              {/* Option 2 */}
              <label className="flex items-start gap-4 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition">
                <input
                  type="checkbox"
                  name="enableShield"
                  value="true"
                  defaultChecked
                  className="mt-1 accent-[#7C3AED] w-4 h-4 rounded border-zinc-800"
                />
                <div>
                  <span className="font-semibold text-zinc-100 text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#7C3AED]" />
                    Enable Security Shield
                  </span>
                  <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                    Automatically scans and filters/flags sensitive email content (bank details, passwords, OTPs).
                  </p>
                </div>
              </label>

              {/* Option 3 */}
              <label className="flex items-start gap-4 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition">
                <input
                  type="checkbox"
                  name="enableShortcuts"
                  value="true"
                  defaultChecked
                  className="mt-1 accent-[#7C3AED] w-4 h-4 rounded border-zinc-800"
                />
                <div>
                  <span className="font-semibold text-zinc-100 text-sm flex items-center gap-1.5">
                    <Keyboard className="w-4 h-4 text-[#7C3AED]" />
                    Enable Keyboard Shortcuts
                  </span>
                  <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                    Unlocks Superhuman-grade keyboard-first controls (`E` to archive, `R` to reply, `C` to compose).
                  </p>
                </div>
              </label>
            </div>

            <button type="submit" className="w-full py-3.5 px-5 bg-gradient-to-r from-[#7C3AED] to-indigo-600 hover:from-[#6D28D9] hover:to-indigo-500 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#7C3AED]/20">
              Start Using Valora <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-zinc-600">
        All integrations are stored securely and encrypted end-to-end.
      </div>
    </main>
  );
}
