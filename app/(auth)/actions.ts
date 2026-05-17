"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must contain at least one letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
}

async function authUserExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string
): Promise<boolean | null> {
  const { data, error } = await supabase.rpc("auth_email_exists", {
    lookup_email: email,
  });

  if (!error && typeof data === "boolean") {
    return data;
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return null;
  }

  const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const targetEmail = email.toLowerCase();
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      return null;
    }

    if (
      data.users.some((user) => user.email?.toLowerCase() === targetEmail)
    ) {
      return true;
    }

    if (data.users.length < perPage) {
      return false;
    }

    page += 1;
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = ((formData.get("email") as string) || "").trim();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent("Invalid credentials")}&email=${encodeURIComponent(email)}`
    );
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validationError = validatePassword(password);
  if (validationError) {
    redirect(`/signup?error=${encodeURIComponent(validationError)}`);
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
