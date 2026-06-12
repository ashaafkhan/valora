import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import DashboardLayoutClient from "./_components/DashboardLayoutClient";

/**
 * Valora — Dashboard Layout (Server)
 * Auth guard — redirects unauthenticated users to /login.
 * Renders the client shell with Sidebar + TopBar + CommandPalette.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardLayoutClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    >
      {children}
    </DashboardLayoutClient>
  );
}
