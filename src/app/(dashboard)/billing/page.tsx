"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Zap, Crown, Building2, CreditCard, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { format } from "date-fns";

// ── Usage Bar ────────────────────────────────────────────────
function UsageBar({ label, used, limit, color = "primary" }: {
  label: string;
  used: number;
  limit: number;
  color?: "primary" | "error" | "warning";
}) {
  const pct = Math.min((used / limit) * 100, 100);
  const colorMap = {
    primary: { bar: "bg-primary", text: "text-primary" },
    error: { bar: "bg-error", text: "text-error" },
    warning: { bar: "bg-warning", text: "text-warning" },
  };
  const c = colorMap[color];

  return (
    <div className="p-4 bg-surface border border-border rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <span className={`text-xs font-bold ${c.text}`}>{used} / {limit}</span>
      </div>
      <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
        <div
          className={`h-full ${c.bar} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-text-muted mt-1.5">{Math.round(pct)}% used</p>
    </div>
  );
}

// ── Plan Card ────────────────────────────────────────────────
function PlanCard({
  icon: Icon,
  name,
  price,
  oldPrice,
  period,
  description,
  features,
  highlight,
  badge,
  cta,
  onUpgrade,
  isCurrent,
  loading,
}: {
  icon: React.ElementType;
  name: string;
  price: string;
  oldPrice?: string;
  period?: string;
  description: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
  cta: string;
  onUpgrade?: () => void;
  isCurrent?: boolean;
  loading?: boolean;
}) {
  return (
    <div className={`relative flex flex-col p-5 rounded-2xl border transition-all ${
      highlight
        ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10"
        : "border-border bg-surface hover:border-border-strong"
    }`}>
      {badge && (
        <div className="absolute -top-3 left-4">
          <span className="text-[10px] font-bold bg-primary text-white px-3 py-1 rounded-full shadow-sm">
            {badge}
          </span>
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${highlight ? "bg-primary/15" : "bg-surface-hover"}`}>
          <Icon className={`w-4 h-4 ${highlight ? "text-primary" : "text-text-muted"}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary">{name}</h3>
          <p className="text-[10px] text-text-muted">{description}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-text-primary">{price}</span>
          {period && <span className="text-xs text-text-muted">/{period}</span>}
        </div>
        {oldPrice && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-text-muted line-through">{oldPrice}</span>
            <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">Early Access</span>
          </div>
        )}
      </div>

      <ul className="space-y-2 mb-5 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-text-secondary">
            <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onUpgrade}
        disabled={isCurrent || loading}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
          isCurrent
            ? "bg-surface-hover text-text-muted cursor-default border border-border"
            : highlight
            ? "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-[0.98]"
            : "border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        } disabled:opacity-50`}
      >
        {isCurrent ? "Current Plan" : loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {cta}
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
}

// ── Billing Page ──────────────────────────────────────────────
export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const existingScript = document.getElementById("razorpay-sdk");
      if (existingScript) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (plan: string) => {
    setError(null);
    setIsUpgrading(plan);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your network connection.");
      }

      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        throw new Error("Failed to create billing order");
      }

      const orderData = (await res.json()) as {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      };

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Valora",
        description: `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        image: "/valora_logo.png",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/billing/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              await fetchProfile();
              alert(`Success! You have upgraded to the ${plan} plan.`);
            } else {
              throw new Error("Payment signature verification failed");
            }
          } catch (err) {
            alert("Verification failed: " + (err instanceof Error ? err.message : "Error"));
          }
        },
        prefill: {
          name: profile?.name || "",
          email: profile?.email || "",
        },
        theme: {
          color: "#0066FF",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade order initialization failed");
    } finally {
      setIsUpgrading(null);
    }
  };

  const currentPlan = profile?.plan || "free";
  const resetDate = profile?.planResetDate ? new Date(profile.planResetDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Define limits dynamically based on plan
  const planLimits = {
    free: { aiMessages: 30, voiceInput: 1, emailCompose: 10 },
    standard: { aiMessages: 150, voiceInput: 15, emailCompose: 50 },
    premium: { aiMessages: 500, voiceInput: 30, emailCompose: 150 },
    enterprise: { aiMessages: 9999, voiceInput: 9999, emailCompose: 9999 },
  };

  const currentPlanKey = (currentPlan in planLimits ? currentPlan : "free") as keyof typeof planLimits;
  const currentLimits = planLimits[currentPlanKey];
  const usage = {
    aiMessages: profile?.aiMessagesUsed || 0,
    voiceInput: profile?.voiceInputUsed || 0,
    emailCompose: profile?.emailComposeUsed || 0,
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Billing
            </h1>
            <p className="text-sm text-text-muted mt-1">Manage your plan and usage</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Current Plan */}
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Current Plan</h2>
            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-sm font-bold text-text-primary capitalize">
                      {currentPlan} — {currentPlan === "free" ? "Free forever" : "Active"}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mb-4">
                    Resets on: {format(resetDate, "MMMM d, yyyy")}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-text-secondary">
                    {[
                      `${currentLimits.aiMessages === 9999 ? "Unlimited" : currentLimits.aiMessages} AI messages/mo`,
                      `${currentLimits.voiceInput === 9999 ? "Unlimited" : currentLimits.voiceInput} voice message/mo`,
                      `${currentLimits.emailCompose === 9999 ? "Unlimited" : currentLimits.emailCompose} email compose/mo`,
                      "Gmail access",
                      "Calendar access",
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-success flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Usage */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">Usage This Cycle</h2>
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                Resets {format(resetDate, "MMM d")}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <UsageBar label="AI Messages" used={usage.aiMessages} limit={currentLimits.aiMessages} />
              <UsageBar label="Voice Input" used={usage.voiceInput} limit={currentLimits.voiceInput} color="warning" />
              <UsageBar label="Email Compose (AI)" used={usage.emailCompose} limit={currentLimits.emailCompose} color="primary" />
            </div>
          </section>

          {/* Upgrade Plans */}
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Upgrade Your Plan</h2>

            {/* Early access banner */}
            <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-text-primary">🔥 Early Access Offer — Limited Time</p>
                <p className="text-xs text-text-muted">Standard Plan is ₹99/mo instead of ₹199/mo. Discount applied automatically.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PlanCard
                icon={Zap}
                name="Standard"
                price="₹99/mo"
                oldPrice="₹199/mo"
                period="month"
                description="For individual professionals"
                features={[
                  "150 AI messages/mo",
                  "15 voice inputs/mo",
                  "50 email compose/mo",
                  "5,000 char limit",
                  "Full Zara AI access",
                  "Smart replies",
                  "Email support",
                ]}
                highlight
                badge="Most Popular"
                cta="Upgrade to Standard"
                onUpgrade={() => handleUpgrade("standard")}
                isCurrent={currentPlan === "standard"}
                loading={isUpgrading === "standard"}
              />
              <PlanCard
                icon={Crown}
                name="Premium"
                price="₹499/mo"
                period="month"
                description="For power users"
                features={[
                  "500 AI messages/mo",
                  "30 voice inputs/mo",
                  "150 email compose/mo",
                  "10,000 char limit",
                  "Everything in Standard",
                  "Priority support",
                  "Advanced analytics",
                ]}
                cta="Upgrade to Premium"
                onUpgrade={() => handleUpgrade("premium")}
                isCurrent={currentPlan === "premium"}
                loading={isUpgrading === "premium"}
              />
              <PlanCard
                icon={Building2}
                name="Enterprise"
                price="₹2,999/mo"
                period="month"
                description="For teams and organizations"
                features={[
                  "Unlimited AI messages",
                  "Unlimited voice input",
                  "Unlimited email compose",
                  "Unlimited char limit",
                  "Custom integrations",
                  "Dedicated support",
                  "Team management",
                ]}
                cta="Contact Sales"
                onUpgrade={() => window.open("mailto:sales@valorahq.in", "_blank")}
                isCurrent={currentPlan === "enterprise"}
              />
            </div>
          </section>

          {/* Payment History */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">Payment History</h2>
              <span className="text-[10px] text-text-muted">Securely processed by Razorpay</span>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 text-center">
              <CreditCard className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">Secure payments with 100% encryption</p>
              <p className="text-xs text-text-muted mt-1">Upgrade to a paid plan above to access premium features.</p>
            </div>
            <p className="text-[11px] text-text-muted text-center mt-3">
              Payments are securely processed by Razorpay. All prices in INR, inclusive of applicable taxes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
