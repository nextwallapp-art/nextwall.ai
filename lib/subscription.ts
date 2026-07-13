import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
]);

export async function hasActiveSubscription(
  customerId: string,
  stripe: Stripe = getStripe(),
): Promise<boolean> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 10,
  });

  return subscriptions.data.some((sub) => ACTIVE_STATUSES.has(sub.status));
}

export async function getOrCreateStripeCustomer(
  stripe: Stripe,
  userId: string,
  email: string | undefined,
  existingCustomerId: string | null | undefined,
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  if (email) {
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      return existing.data[0].id;
    }
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { supabase_user_id: userId },
  });

  return customer.id;
}

export async function saveStripeCustomerId(
  userId: string,
  customerId: string,
): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("[subscription] Missing SUPABASE_SERVICE_ROLE_KEY");
    return;
  }

  const { error } = await admin
    .from("user_profiles")
    .update({ stripe_customer_id: customerId })
    .eq("user_id", userId);

  if (error) {
    console.error("[subscription] Failed to save stripe_customer_id:", error.message);
  }
}

export async function resolveStripeCustomerId(
  stripe: Stripe,
  supabaseUrl: string,
  supabaseAnonKey: string,
  token: string,
  userId: string,
  email: string | undefined,
): Promise<string | null> {
  const storedId = await fetchStripeCustomerId(userId);
  if (storedId) return storedId;

  if (!email) return null;

  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) return null;

  const customerId = customers.data[0].id;
  await saveStripeCustomerId(userId, customerId);
  return customerId;
}

export async function fetchStripeCustomerId(
  userId: string,
): Promise<string | null> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("[subscription] Missing SUPABASE_SERVICE_ROLE_KEY");
    return null;
  }

  const { data, error } = await admin
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[subscription] Profile fetch error:", error.message);
    return null;
  }

  return data?.stripe_customer_id ?? null;
}
