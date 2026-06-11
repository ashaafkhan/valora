import { signIn } from "@/server/auth";
import { Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";

interface PageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = params.error;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] text-[#F8F8F8] px-4 relative">
      {/* Premium Glassmorphic Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C3AED]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] bg-[#111111]/80 backdrop-blur-xl border border-[#222222] rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Accent Top Border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent" />

        {/* Logo Container */}
        <div className="mx-auto w-20 h-20 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-2xl flex items-center justify-center mb-6 relative group">
          <div className="absolute inset-0 rounded-2xl bg-[#7C3AED]/20 blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
          <Image
            src="/valora_logo.png"
            alt="Valora Logo"
            width={64}
            height={64}
            className="w-12 h-12 object-contain relative z-10"
            priority
          />
        </div>

        {/* Brand Information */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Valora
        </h1>
        <p className="text-[#888888] text-xs mt-1.5 uppercase font-mono tracking-widest">
          "Command your inbox. Own your time."
        </p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-6 mb-2">
          Sign in to Valora
        </h2>
        <p className="text-[#888888] text-sm mb-8">
          Connect your Gmail and Google Calendar to access your zero-friction command center.
        </p>

        {/* Auth Errors */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-left">
            <span className="font-semibold">Authentication Error:</span> {error === "OAuthSignin" ? "Failed to start sign-in flow." : "Access denied or invalid credentials."}
          </div>
        )}

        {/* Login Buttons */}
        <div className="space-y-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/connect" });
            }}
          >
            <button
              type="submit"
              className="w-full py-3 px-5 bg-white hover:bg-zinc-100 text-black rounded-xl font-semibold transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-black/20 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              // Fallback since Google is primary and handles all permissions
              await signIn("google", { redirectTo: "/connect" });
            }}
          >
            <button
              type="submit"
              className="w-full py-3 px-5 bg-transparent hover:bg-zinc-900 text-zinc-300 hover:text-white border border-[#222222] hover:border-zinc-700 rounded-xl font-semibold transition duration-200 flex items-center justify-center gap-2 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Continue with GitHub
            </button>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <p className="mt-8 text-xs text-zinc-600">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </main>
  );
}
