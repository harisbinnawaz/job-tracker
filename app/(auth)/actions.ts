"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message));
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate password
  const validationError = validatePassword(password);
  if (validationError) {
    return redirect('/signup?error=' + encodeURIComponent(validationError));
  }

  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`
    }
  });

  if (error) {
    return redirect('/signup?error=' + encodeURIComponent(error.message));
  }

  // Check if email confirmation is required
  // If data.session is null, email confirmation is needed
  if (data.session === null) {
    // Email confirmation required - tell user to check email
    redirect('/signup?message=Check+your+email+to+confirm+your+account');
  } else {
    // No email confirmation needed - user is logged in
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
