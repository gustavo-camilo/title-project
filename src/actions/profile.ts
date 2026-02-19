"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  preferredLocale: z.enum(["en", "pt"]),
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    preferredLocale: formData.get("preferredLocale") || "en",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      preferred_locale: parsed.data.preferredLocale,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Could not update profile. Please try again." };
  }

  return { success: true };
}
