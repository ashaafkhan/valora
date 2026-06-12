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
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-text-primary p-6 relative theme-transition">
      {/* Premium Glassmorphic Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-primary-light/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg valora-glass rounded-2xl p-8 shadow-2xl relative overflow-hidden valora-glow-strong">
        {/* Accent Top Border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Header and Step Indicator */}
        <div className="flex justify-between items-center mb-8 border-b border-border/80 pb-6 bg-background/5 -mx-8 px-8">
          <div>
            <h1 className="text-xl font-bold font-sans text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Welcome to Valora
            </h1>
            <p className="text-text-secondary text-xs mt-1">
              Let&apos;s set up your premium workspace.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep >= 1 ? "bg-primary w-4" : "bg-surface-hover border border-border/30"}`} />
            <span className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep >= 2 ? "bg-primary w-4" : "bg-surface-hover border border-border/30"}`} />
            <span className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep >= 3 ? "bg-primary w-4" : "bg-surface-hover border border-border/30"}`} />
          </div>
        </div>

        {/* Error Notification */}
        {params.error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-sans">
            <span className="font-semibold font-sans">Connection failed:</span> {params.error}
          </div>
        )}

        {/* Step 1: Connect Gmail */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-error/10 border border-error/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-error" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Step 1: Connect Gmail</h2>
                <p className="text-text-secondary text-sm mt-1">
                  Valora syncs your emails locally, applies AI priority scoring, and enables fast semantic search.
                </p>
              </div>
            </div>

            <div className="bg-background border border-border rounded-xl p-4 text-xs text-text-secondary space-y-2">
              <p className="font-semibold text-text-primary">Required Permissions:</p>
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
              <button className="w-full py-3.5 px-5 bg-primary hover:bg-primary-light text-primary-foreground font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer active:scale-[0.98]">
                Connect Gmail <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Connect Calendar */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-primary-light" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Step 2: Connect Google Calendar</h2>
                <p className="text-text-secondary text-sm mt-1">
                  Connect your calendar to view schedules, manage meetings, and use natural-language quick scheduling.
                </p>
              </div>
            </div>

            <div className="p-4 bg-success/10 border border-success/20 text-success rounded-xl flex items-center gap-2.5 text-xs font-sans">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Gmail integration connected successfully!</span>
            </div>

            <form action={async () => {
              "use server";
              const url = await getOAuthUrl("googlecalendar", userId);
              redirect(url);
            }}>
              <button className="w-full py-3.5 px-5 bg-text-primary hover:bg-text-primary/90 text-background font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-black/10 cursor-pointer active:scale-[0.98]">
                Connect Google Calendar <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Personalize */}
        {currentStep === 3 && (
          <form action={completeOnboarding.bind(null, userId)} className="space-y-6 animate-fade-in font-sans">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Step 3: Personalize Valora</h2>
              <p className="text-text-secondary text-sm mt-1">
                Choose which features you want to activate for your command center.
              </p>
            </div>

            <div className="space-y-4">
              {/* Option 1 */}
              <label className="flex items-start gap-4 p-4 bg-background/40 border border-border rounded-xl cursor-pointer hover:border-primary/40 transition theme-transition">
                <input
                  type="checkbox"
                  name="enableAI"
                  value="true"
                  defaultChecked
                  className="mt-1 accent-primary w-4 h-4 rounded border-border bg-background cursor-pointer"
                />
                <div>
                  <span className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary-light" />
                    Enable AI Priority Inbox
                  </span>
                  <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">
                    Uses Groq Llama-3 to automatically tag emails with priority levels (Urgent, High, Normal, Low).
                  </p>
                </div>
              </label>

              {/* Option 2 */}
              <label className="flex items-start gap-4 p-4 bg-background/40 border border-border rounded-xl cursor-pointer hover:border-primary/40 transition theme-transition">
                <input
                  type="checkbox"
                  name="enableShield"
                  value="true"
                  defaultChecked
                  className="mt-1 accent-primary w-4 h-4 rounded border-border bg-background cursor-pointer"
                />
                <div>
                  <span className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-primary-light" />
                    Enable Security Shield
                  </span>
                  <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">
                    Automatically scans and filters/flags sensitive email content (bank details, passwords, OTPs).
                  </p>
                </div>
              </label>

              {/* Option 3 */}
              <label className="flex items-start gap-4 p-4 bg-background/40 border border-border rounded-xl cursor-pointer hover:border-primary/40 transition theme-transition">
                <input
                  type="checkbox"
                  name="enableShortcuts"
                  value="true"
                  defaultChecked
                  className="mt-1 accent-primary w-4 h-4 rounded border-border bg-background cursor-pointer"
                />
                <div>
                  <span className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                    <Keyboard className="w-4 h-4 text-primary-light" />
                    Enable Keyboard Shortcuts
                  </span>
                  <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">
                    Unlocks Superhuman-grade keyboard-first controls (`E` to archive, `R` to reply, `C` to compose).
                  </p>
                </div>
              </label>
            </div>

            <button type="submit" className="w-full py-3.5 px-5 bg-gradient-to-r from-primary to-primary-light hover:brightness-110 text-primary-foreground font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer active:scale-[0.98]">
              Start Using Valora <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-text-muted">
        All integrations are stored securely and encrypted end-to-end.
      </div>
    </main>
  );
}
