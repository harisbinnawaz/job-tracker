"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { JobInsert, JobUpdate } from "@/lib/types";

// --- READ ---
export async function getJobs() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
      return [];
    }

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("date_applied", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
    return data ?? [];
  } catch (error) {
    console.error("Error in getJobs:", error);
    return [];
  }
}

// --- CREATE ---
export async function createJob(payload: JobInsert) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
      return;
    }

    const { error } = await supabase
      .from("jobs")
      .insert({ ...payload, user_id: user.id });

    if (error) {
      console.error("Error creating job:", error);
      throw new Error(error.message);
    }
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error in createJob:", error);
    throw error;
  }
}

// --- UPDATE ---
export async function updateJob(id: string, payload: JobUpdate) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
      return;
    }

    const { error } = await supabase
      .from("jobs")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating job:", error);
      throw new Error(error.message);
    }
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error in updateJob:", error);
    throw error;
  }
}

// --- DELETE ---
export async function deleteJob(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
      return;
    }

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting job:", error);
      throw new Error(error.message);
    }
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error in deleteJob:", error);
    throw error;
  }
}
