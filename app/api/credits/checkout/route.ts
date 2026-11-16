import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  // 1. Authenticate via the cookie session.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2. Which product?
  const body = await req.json().catch(() => ({}));
  const productId = typeof body.product_id === "string" ? body.product_id : "";
  if (!productId) {
    return NextResponse.json({ error: "product_id required" }, { status: 400 });
  }

  // 3. Must be an active product with a Stripe price (RLS lets signed-in users read active products).
  const { data: product } = await supabase
    .from("credit_products")
    .select("id, credits, stripe_price_id")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();
  if (!product || !product.stripe_price_id) {
    return NextResponse.json({ error: "product not available" }, { status: 400 });
  }

  // 4. Origin-based URLs so the same code works on the Vercel URL and a custom domain later.
  const originHeader = req.headers.get("origin");
  const origin = originHeader && /^https?:\/\//i.test(originHeader) ? originHeader : process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) {
    return NextResponse.json({ error: "cannot determine site origin" }, { status: 400 });
  }

  // 5. Create the Checkout Session. Credits are granted by the webhook, never here.
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: product.stripe_price_id, quantity: 1 }],
      success_url: `${origin}/credits/success`,
      cancel_url: `${origin}/credits`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        product_id: String(product.id),
        credits: String(product.credits),
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout session create failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 502 });
  }
}
