import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return { url, anonKey };
}

function authClient(url: string, anonKey: string, token: string) {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

async function getAuthenticatedUser(request: Request) {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    return {
      error: NextResponse.json(
        { error: "Server misconfigured: missing Supabase env vars" },
        { status: 500 },
      ),
    };
  }

  const token = request.headers
    .get("Authorization")
    ?.replace("Bearer ", "")
    .trim();

  console.log("[user-profile] Auth token present:", !!token);

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
    console.error(
      "[user-profile] Auth failed:",
      authError?.message ?? "no user",
    );
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  console.log("[user-profile] Authenticated user:", user.id);
  return { url, anonKey, token, userId: user.id };
}

export async function GET(request: Request) {
  console.log("[user-profile] GET — checking profile");

  const auth = await getAuthenticatedUser(request);
  if ("error" in auth && auth.error) return auth.error;

  const { url, anonKey, token, userId } = auth as {
    url: string;
    anonKey: string;
    token: string;
    userId: string;
  };

  const client = authClient(url, anonKey, token);
  const { data, error } = await client
    .from("user_profiles")
    .select(
      "id, user_id, experience_level, selected_assets, custom_assets, free_text, created_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[user-profile] GET error:", error.message, error.code);
    return NextResponse.json(
      {
        hasProfile: false,
        error: error.message,
        hint:
          error.code === "42P01"
            ? "La tabla user_profiles no existe. Ejecuta supabase/user_profiles.sql en Supabase."
            : undefined,
      },
      { status: 200 },
    );
  }

  console.log("[user-profile] GET result:", data ? `found id=${data.id}` : "no profile");
  return NextResponse.json({ hasProfile: !!data, profile: data ?? null });
}

export async function POST(request: Request) {
  console.log("[user-profile] POST — saving profile");

  const auth = await getAuthenticatedUser(request);
  if ("error" in auth && auth.error) return auth.error;

  const { url, anonKey, token, userId } = auth as {
    url: string;
    anonKey: string;
    token: string;
    userId: string;
  };

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

  console.log("[user-profile] POST payload:", {
    userId,
    experience_level: body.experience_level,
    selected_assets: body.selected_assets,
    custom_assets: body.custom_assets,
    has_free_text: !!body.free_text,
  });

  const customAssetsValue =
    body.custom_assets == null
      ? null
      : typeof body.custom_assets === "string"
        ? body.custom_assets
        : JSON.stringify(body.custom_assets);

  const client = authClient(url, anonKey, token);

  const { data: existing, error: existingError } = await client
    .from("user_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    console.error("[user-profile] POST existing check error:", existingError.message);
    return NextResponse.json(
      {
        error: existingError.message,
        hint:
          existingError.code === "42P01"
            ? "La tabla user_profiles no existe. Ejecuta supabase/user_profiles.sql en Supabase."
            : undefined,
      },
      { status: 500 },
    );
  }

  if (existing) {
    console.log("[user-profile] POST — profile already exists, id=", existing.id);
    return NextResponse.json({ success: true, profileId: existing.id });
  }

  const { data: inserted, error: insertError } = await client
    .from("user_profiles")
    .insert({
      user_id: userId,
      experience_level: body.experience_level ?? null,
      selected_assets: body.selected_assets ?? null,
      custom_assets: customAssetsValue,
      free_text: body.free_text ?? null,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[user-profile] POST insert error:", insertError.message, insertError.code);
    return NextResponse.json(
      {
        error: insertError.message,
        code: insertError.code,
        hint:
          insertError.code === "42P01"
            ? "La tabla user_profiles no existe. Ejecuta supabase/user_profiles.sql en Supabase."
            : insertError.code === "42501"
              ? "Permiso denegado. Verifica las políticas RLS en user_profiles."
              : undefined,
      },
      { status: 500 },
    );
  }

  console.log("[user-profile] POST success — inserted id=", inserted.id);
  return NextResponse.json({ success: true, profileId: inserted.id });
}
