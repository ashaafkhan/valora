import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

/**
 * Root page — redirects based on auth state:
 * - Authenticated → /inbox (main command center)
 * - Unauthenticated → /login
 */
export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/inbox");
  } else {
    redirect("/login");
  }
}
