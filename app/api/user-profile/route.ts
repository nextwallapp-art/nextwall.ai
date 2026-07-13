import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROFILE_SELECT =
  "id, user_id, experience_level, selected_assets, custom_assets, free_text, last_onboarding_date, created_at";

const PROFILE_SELECT_BASE =
  "id, user_id, experience_level, selected_assets, custom_assets, free_text, created_at";

function isMissingColumn(error: { message?: string }, column: string): boolean {
  return error.message?.includes(column) ?? false;
}

async function authenticate(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return {
      error: NextResponse.json(
        { error: "Server misconfigured: missing Supabase env vars" },
        { status: 500 },
      ),
    };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return {
      error: NextResponse.json(
        {
          error: "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local",
          hint:
            "Supabase → Project Settings → API → service_role → copia la clave en .env.local",
        },
        { status: 500 },
      ),
    };
  }

  const token = request.headers
    .get("Authorization")
    ?.replace("Bearer ", "")
    .trim();

  if (!token) {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  const supabase = createClient(url, anonKey);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  return { userId: user.id, admin };
}

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if ("error" in auth) return auth.error;

  const { userId, admin } = auth;

  let { data, error } = await admin
    .from("user_profiles")
    .select(PROFILE_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (error && isMissingColumn(error, "last_onboarding_date")) {
    ({ data, error } = await admin
      .from("user_profiles")
      .select(PROFILE_SELECT_BASE)
      .eq("user_id", userId)
      .maybeSingle());
  }

  if (error) {
    console.error("[user-profile] GET error:", error.message);
    return NextResponse.json(
      { hasProfile: false, error: error.message },
      { status: 200 },
    );
  }

  return NextResponse.json({ hasProfile: !!data, profile: data ?? null });
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if ("error" in auth) return auth.error;

  const { userId, admin } = auth;

  let body: {
    experience_level?: string | null;
    selected_assets?: unknown;
    custom_assets?: Record<string, string> | string | null;
    free_text?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const customAssetsValue =
    body.custom_assets == null
      ? null
      : typeof body.custom_assets === "string"
        ? body.custom_assets
        : JSON.stringify(body.custom_assets);

  const record = {
    user_id: userId,
    experience_level: body.experience_level ?? null,
    selected_assets: body.selected_assets ?? null,
    custom_assets: customAssetsValue,
    free_text: body.free_text ?? null,
    last_onboarding_date: new Date().toISOString(),
  };

  let { data, error } = await admin
    .from("user_profiles")
    .upsert(record, { onConflict: "user_id" })
    .select("id")
    .single();

  if (error && isMissingColumn(error, "last_onboarding_date")) {
    const { last_onboarding_date: _dropped, ...withoutDate } = record;
    ({ data, error } = await admin
      .from("user_profiles")
      .upsert(withoutDate, { onConflict: "user_id" })
      .select("id")
      .single());
  }

  if (error) {
    console.error("[user-profile] POST error:", error.message, error.code);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, profileId: data.id });
}
