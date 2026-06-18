export type PlanType = "free" | "pro" | "promax" | "enterprise";

export const PRICING_LIMITS: Record<PlanType, { aiMessages: number; emailCompose: number; voiceInput: number }> = {
  free: {
    aiMessages: 30,
    emailCompose: 15,
    voiceInput: 5,
  },
  pro: {
    aiMessages: 150,
    emailCompose: 50,
    voiceInput: 15,
  },
  promax: {
    aiMessages: 500,
    emailCompose: 150,
    voiceInput: 30,
  },
  enterprise: {
    aiMessages: 999999,
    emailCompose: 999999,
    voiceInput: 999999,
  },
};

export const PRICING_PRICES: Record<PlanType, { amount: number; name: string }> = {
  free: { amount: 0, name: "Free" },
  pro: { amount: 129, name: "Pro" },
  promax: { amount: 499, name: "Pro Max" },
  enterprise: { amount: 0, name: "Enterprise" }, // Contact us
};
