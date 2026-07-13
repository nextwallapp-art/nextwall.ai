import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  fetchStripeCustomerId,
  getOrCreateStripeCustomer,
  saveStripeCustomerId,
} from "@/lib/subscription";
import { SITE_URL } from "@/lib/site";

function getBaseUrl(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return SITE_URL;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const existingCustomerId = await fetchStripeCustomerId(user.id);

    const baseUrl = getBaseUrl(request);
    const stripe = getStripe();

    const customerId = await getOrCreateStripeCustomer(
      stripe,
      user.id,
      user.email ?? undefined,
      existingCustomerId,
    );

    if (existingCustomerId !== customerId) {
      await saveStripeCustomerId(user.id, customerId);
    }

    const trialDays = Number(process.env.STRIPE_TRIAL_DAYS ?? "14");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      payment_method_options: {
        card: { request_three_d_secure: "automatic" },
      },
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "NextWall Pro",
              description: "Entiende por qué tus inversiones suben o bajan",
            },
            unit_amount: 499,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: trialDays,
      },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/onboarding`,
      cancel_url: `${baseUrl}/payment?cancelled=true`,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe no devolvió una URL de pago" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);

    if (error instanceof Stripe.errors.StripeAuthenticationError) {
      return NextResponse.json(
        {
          error:
            "La clave secreta de Stripe no es válida. Copia de nuevo STRIPE_SECRET_KEY desde el dashboard de Stripe (Developers → API keys) y reinicia el servidor.",
        },
        { status: 500 },
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("STRIPE_SECRET_KEY")
    ) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "No se pudo crear la sesión de pago" },
      { status: 500 },
    );
  }
}
