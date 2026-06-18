"use client";

import { useState, useEffect } from "react";
import { Loader2, Zap, Check } from "lucide-react";
import { PRICING_LIMITS, PRICING_PRICES, type PlanType } from "@/lib/pricing";

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  useEffect(() => {
    // We fetch current user data from a generic user route or agent route
    // Here we use a generic fetch since we need their limits
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Dynamically load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpgrade = async (planToUpgradeTo: PlanType) => {
    setUpgradeLoading(planToUpgradeTo);
    try {
      const orderRes = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planToUpgradeTo }),
      });
      const orderData = await orderRes.json();

      if (!orderData.orderId) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Valora",
        description: `Upgrade to ${PRICING_PRICES[planToUpgradeTo].name} Plan`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment successful! Your plan has been upgraded.");
            window.location.reload();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#0066ff",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong initiating payment.");
    } finally {
      setUpgradeLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-red-500">Failed to load user data.</div>;
  }

  const currentPlan = (user.plan as PlanType) || "free";
  const limits = PRICING_LIMITS[currentPlan];

  // Calculate percentages
  const aiPct = Math.min((user.aiMessagesUsed / limits.aiMessages) * 100, 100);
  const voicePct = Math.min((user.voiceInputUsed / limits.voiceInput) * 100, 100);
  const composePct = Math.min((user.emailComposeUsed / limits.emailCompose) * 100, 100);

  const resetDate = new Date(user.planResetDate);
  resetDate.setMonth(resetDate.getMonth() + 1);

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans pb-24 text-zinc-100">
      <h1 className="text-2xl font-bold mb-8">Billing & Plan</h1>

      {/* Current Plan Card */}
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
          <button 
            onClick={() => document.getElementById('upgrade-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 bg-white text-black font-semibold rounded-lg text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            Upgrade plan
          </button>
        </div>
        
        <div className="inline-block px-3 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400 mb-4 font-medium uppercase tracking-wider">
          Current Plan
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-2 capitalize">{currentPlan}</h2>
        <p className="text-xl text-zinc-400 mb-4">
          {currentPlan === "free" ? "Free forever" : `${PRICING_PRICES[currentPlan].name} license`}
        </p>
        <p className="text-sm text-zinc-500 mb-8 flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Resets on {resetDate.toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="border-t border-zinc-800 pt-8">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">What's included</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-zinc-300">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {limits.aiMessages} AI messages / month</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {limits.voiceInput} voice messages / month</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {limits.emailCompose} email composes / month</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Gmail + Calendar access</div>
          </div>
        </div>
      </div>

      {/* Usage this cycle */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-semibold">Usage this cycle</h3>
          <span className="text-xs text-zinc-500">Resets {resetDate.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UsageCard title="AI Messages" used={user.aiMessagesUsed} limit={limits.aiMessages} pct={aiPct} color="bg-blue-500" />
          <UsageCard title="Voice Input" used={user.voiceInputUsed} limit={limits.voiceInput} pct={voicePct} color="bg-purple-500" />
          <UsageCard title="Email Compose" used={user.emailComposeUsed} limit={limits.emailCompose} pct={composePct} color="bg-green-500" />
        </div>
      </div>

      {/* Upgrade options */}
      <div id="upgrade-section">
        <h3 className="text-xl font-semibold mb-4">Upgrade your plan</h3>
        <div className="space-y-4">
          <UpgradeCard 
            plan="pro"
            name="Pro"
            price="₹129/mo"
            description="150 AI messages • 15 voice messages • 50 email composes / month"
            current={currentPlan === "pro"}
            loading={upgradeLoading === "pro"}
            onUpgrade={() => handleUpgrade("pro")}
          />
          <UpgradeCard 
            plan="promax"
            name="Pro Max"
            price="₹499/mo"
            description="500 AI messages • 30 voice messages • 150 email composes / month"
            current={currentPlan === "promax"}
            loading={upgradeLoading === "promax"}
            onUpgrade={() => handleUpgrade("promax")}
          />
          
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center">
                  <span className="text-xs">🏢</span>
                </div>
                <span className="font-semibold text-lg">Enterprise</span>
              </div>
              <p className="text-sm text-zinc-400">Unlimited AI messages • Unlimited voice • Unlimited compose • Custom Integrations</p>
            </div>
            <a 
              href="mailto:ashaaf92@gmail.com"
              className="mt-4 md:mt-0 px-6 py-2 bg-zinc-800 text-white font-semibold rounded-lg text-sm hover:bg-zinc-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-xs text-zinc-600 mb-2">Powered by Razorpay</p>
        <p className="text-[10px] text-zinc-600 max-w-lg mx-auto">
          Payments are securely processed by Razorpay. We never store your card details. All prices in INR, inclusive of applicable taxes.
        </p>
      </div>
    </div>
  );
}

function UsageCard({ title, used, limit, pct, color }: { title: string; used: number; limit: number; pct: number; color: string }) {
  return (
    <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5">
      <div className="flex justify-between text-sm mb-4">
        <span className="text-zinc-300 font-medium flex items-center gap-2">
          {title}
        </span>
        <span className="text-zinc-400"><span className="text-white">{used}</span>/{limit}</span>
      </div>
      <div className="w-full bg-zinc-800 h-1.5 rounded-full mb-2 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
      <p className="text-xs text-zinc-500">{Math.round(pct)}% used this cycle</p>
    </div>
  );
}

function UpgradeCard({ plan, name, price, description, current, loading, onUpgrade }: any) {
  return (
    <div className={`bg-[#121214] border ${current ? 'border-primary shadow-[0_0_15px_rgba(0,102,255,0.15)]' : 'border-zinc-800'} rounded-xl p-6 flex flex-col md:flex-row justify-between items-center transition-all`}>
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-6 h-6 rounded bg-[#1A1A1A] flex items-center justify-center border border-zinc-700">
            <span className="text-primary text-xs font-bold">✨</span>
          </div>
          <span className="font-semibold text-lg">{name}</span>
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded ml-2">{price}</span>
          {current && <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded ml-2">Current</span>}
        </div>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      
      {!current && (
        <button 
          onClick={onUpgrade}
          disabled={loading}
          className="mt-4 md:mt-0 px-6 py-2 bg-white text-black font-semibold rounded-lg text-sm hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Upgrade &rarr;
        </button>
      )}
    </div>
  );
}
