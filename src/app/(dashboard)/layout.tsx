import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import Sidebar from "@/components/shared/Sidebar";

/**
 * Valora — Dashboard Layout
 * Wraps all authenticated routes with the sidebar.
 * Protects all child routes — redirects unauthenticated users to /login.
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#080808]">
      <Sidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
