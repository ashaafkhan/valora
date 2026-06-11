import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "Valora — Command your inbox. Own your time.",
    template: "%s | Valora",
  },
  description:
    "The AI-native command center for email and calendar. Powered by Corsair integrations and a production-grade AI agent.",
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
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/valora_logo.png" },
  ],
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
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background font-sans text-text-primary antialiased">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
