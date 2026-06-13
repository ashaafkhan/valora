import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { corsair } from "@/server/corsair";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

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

  let currentStep = 1;
  if (hasGmail && !hasCalendar) {
    currentStep = 2;
  } else if (hasGmail && hasCalendar) {
    currentStep = 3;
  }

  return (
    <OnboardingWizard
      userId={userId}
      userName={session.user.name}
      userImage={session.user.image}
      hasGmail={hasGmail}
      hasCalendar={hasCalendar}
      currentStep={currentStep}
      error={params.error}
    />
  );
}
