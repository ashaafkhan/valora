import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "Valora",
    template: "%s | Valora",
  },
  description:
    "Command your inbox. Own your time. The AI-first email and calendar command center.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://valorahq.in",
  ),
  openGraph: {
    title: "Valora — Command your inbox. Own your time.",
    description:
      "The AI-native command center for email and calendar. Keyboard-first, AI-first, zero-friction.",
    url: "https://valorahq.in",
    siteName: "Valora",
    images: [{ url: "/valora_logo.png", width: 800, height: 800, alt: "Valora Logo" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Valora — Command your inbox. Own your time.",
    description:
      "The AI-native command center for email and calendar. Keyboard-first, AI-first, zero-friction.",
    images: ["/valora_logo.png"],
    creator: "@valorahq",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/valora_logo.png",
  },
  keywords: [
    "email client",
    "AI email",
    "Gmail",
    "Google Calendar",
    "productivity",
    "command center",
    "keyboard shortcuts",
  ],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background font-sans text-text-primary antialiased">
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <SessionProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </SessionProvider>
          <Toaster
            theme="system"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
