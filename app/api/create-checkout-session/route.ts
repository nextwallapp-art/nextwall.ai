import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    throw new Error("STRIPE_SECRET_KEY has an invalid format");
  }
  return new Stripe(secretKey);
}

function getBaseUrl(request: Request) {
  return (
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const baseUrl = getBaseUrl(request);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      payment_method_options: {
        card: { request_three_d_secure: "automatic" },
      },
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
      customer_email: user.email ?? undefined,
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
