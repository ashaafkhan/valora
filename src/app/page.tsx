import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

/**
 * Root page — redirects based on auth and onboarding state:
 * - Authenticated & Onboarding Done → /inbox (main command center)
 * - Authenticated & Onboarding NOT Done → /onboarding
 * - Unauthenticated → /login
 */
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
  } else {
    redirect("/login");
  }
}
