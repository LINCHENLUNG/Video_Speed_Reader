"use client";

import { useState } from "react";

export type CreditProduct = {
  id: string;
  name: string;
  credits: number;
  price_usd: number;
};

/** Three tier cards with Buy buttons. One shared purchasingId disables every button while a checkout is in flight. */
export function CreditTiers({ products }: { products: CreditProduct[] }) {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // Baseline = smallest-credits tier; bonus badge shows how much cheaper per credit a tier is.
  const baseline = products.reduce<CreditProduct | null>(
    (min, p) => (min === null || p.credits < min.credits ? p : min),
    null,
  );
  const baselineRate = baseline ? baseline.price_usd / baseline.credits : 0;

  async function buy(productId: string) {
    if (purchasingId) return;
    setPurchasingId(productId);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) {
        alert(body.error ?? "Checkout failed / 結帳失敗");
        setPurchasingId(null);
        return;
      }
      // Leave purchasingId set: the page is navigating away to Stripe.
      window.location.href = body.url;
    } catch {
      alert("Checkout failed / 結帳失敗");
      setPurchasingId(null);
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {products.map((p) => {
        const rate = p.price_usd / p.credits;
        const bonusPct = baselineRate > 0 ? Math.round((1 - rate / baselineRate) * 100) : 0;
        const busy = purchasingId === p.id;
        return (
          <div key={p.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-card p-6">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-white">{p.name}</h3>
              {bonusPct > 0 && (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                  +{bonusPct}%
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-white">${Number(p.price_usd).toFixed(2)}</p>
            <p className="text-sm text-zinc-400">${rate.toFixed(2)} / credit</p>
            <button
              type="button"
              onClick={() => buy(p.id)}
              disabled={purchasingId !== null}
              className="mt-auto rounded-lg bg-violet-400 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Redirecting… / 前往結帳…" : "Buy / 購買"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
