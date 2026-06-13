import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, Calendar, CheckCircle2, AlertCircle, ShieldAlert, ArrowRight, ArrowLeft, LogIn, Sparkles } from "lucide-react";
import { auth } from "@/server/auth";
import { corsair } from "@/server/corsair";
import { resolveConnectLink } from "corsair";
import { generateOAuthUrl } from "corsair/oauth";

import { headers } from "next/headers";

// Server Action to generate OAuth link for manual integrations
async function getOAuthUrl(pluginId: string, userId: string) {
  "use server";
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/corsair/callback`;

  const result = await generateOAuthUrl(corsair, pluginId, {
    tenantId: userId,
    redirectUri,
  });
  return result.url;
}

interface PageProps {
  searchParams: Promise<{
    state?: string;
    success?: string;
    plugin?: string;
    error?: string;
  }>;
}

export default async function ConnectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();

  // If not logged in, show sign-in screen
  if (!session?.user?.id) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] text-white px-4">
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          
          <div className="mx-auto w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2 font-sans">
            Welcome to <span className="text-purple-400 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Valora</span>
          </h1>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            The premium Superhuman-style command center. Log in to configure your integrations.
          </p>

          <Link
            href="/api/auth/signin?callbackUrl=/connect"
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl font-semibold transition duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-purple-900/20"
          >
            <LogIn className="w-5 h-5 text-white transition-transform group-hover:translate-x-[2px]" />
            Sign in with Google
          </Link>
        </div>
      </main>
    );
  }

  const userId = session.user.id;

  // Handle flow where an agent initiated auth via 'state'
  let agentConnectInfo = null;
  if (params.state) {
    try {
      const resolved = await resolveConnectLink(corsair, params.state);
      agentConnectInfo = {
        providerName: resolved.providerName,
        oauthUrl: resolved.oauthUrl,
        state: params.state,
      };
    } catch (err) {
      console.error("Error resolving agent connect link:", err);
    }
  }

  // Fetch connection status for all plugins
  const status = await corsair.manage.connectionStatus.get({ tenantId: userId });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] text-white p-6 relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold font-sans text-zinc-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" />
              Valora Integrations
            </h1>
            <p className="text-zinc-400 text-xs mt-1">
              Logged in as <span className="text-zinc-300 font-medium">{session.user.email}</span>
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </div>

        {/* Status Alerts */}
        {params.success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>
              Successfully connected <span className="font-semibold text-emerald-300">{params.plugin === "googlecalendar" ? "Google Calendar" : "Gmail"}</span>!
            </span>
          </div>
        )}

        {params.error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-rose-300">Failed to connect integration</p>
              <p className="text-xs text-rose-400/80 mt-0.5">{params.error}</p>
            </div>
          </div>
        )}

        {/* Agent Initiated Integration (Direct Flow) */}
        {agentConnectInfo ? (
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-indigo-500" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-zinc-100">Agent Requested Access</h2>
                <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                  Your AI copilot is asking to connect to your <span className="font-semibold text-purple-300">{agentConnectInfo.providerName}</span>. This is required to execute the requested command.
                </p>

                <div className="mt-6 flex gap-3">
                  <a
                    href={agentConnectInfo.oauthUrl}
                    className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-purple-900/10"
                  >
                    Authorize Integration <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link
                    href="/connect"
                    className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Standard Integrations List */}
        <div className="space-y-4">
          {/* Gmail Card */}
          <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-200 hover:border-zinc-700/80">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100">Gmail</h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  Read, send, and manage your emails. Power your AI Inbox.
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${status.gmail === "connected" ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                    {status.gmail === "connected" ? "Connected" : "Not Linked"}
                  </span>
                </div>
              </div>
            </div>
            
            {status.gmail === "connected" ? (
              <form action={async () => {
                "use server";
                // Let the user re-auth if needed
                const url = await getOAuthUrl("gmail", userId);
                redirect(url);
              }}>
                <button className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 rounded-xl transition border border-zinc-700/50">
                  Reconnect
                </button>
              </form>
            ) : (
              <form action={async () => {
                "use server";
                const url = await getOAuthUrl("gmail", userId);
                redirect(url);
              }}>
                <button className="py-2.5 px-5 bg-white hover:bg-zinc-100 text-xs font-semibold text-black rounded-xl transition shadow-md shadow-black/10 flex items-center gap-1.5">
                  Connect Account <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Google Calendar Card */}
          <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-200 hover:border-zinc-700/80">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100">Google Calendar</h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  View, schedule, and organize meetings via command center.
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${status.googlecalendar === "connected" ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                    {status.googlecalendar === "connected" ? "Connected" : "Not Linked"}
                  </span>
                </div>
              </div>
            </div>

            {status.googlecalendar === "connected" ? (
              <form action={async () => {
                "use server";
                const url = await getOAuthUrl("googlecalendar", userId);
                redirect(url);
              }}>
                <button className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 rounded-xl transition border border-zinc-700/50">
                  Reconnect
                </button>
              </form>
            ) : (
              <form action={async () => {
                "use server";
                const url = await getOAuthUrl("googlecalendar", userId);
                redirect(url);
              }}>
                <button className="py-2.5 px-5 bg-white hover:bg-zinc-100 text-xs font-semibold text-black rounded-xl transition shadow-md shadow-black/10 flex items-center gap-1.5">
                  Connect Account <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldAlert className="w-3.5 h-3.5 text-zinc-600" />
          Credentials are encrypted end-to-end using AES-GCM
        </div>
      </div>
    </main>
  );
}
